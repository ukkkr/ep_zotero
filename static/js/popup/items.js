// Dialog for items insertion
function createItemsPopup(xml, collectionTitle) {
    var $itemsPopup = jQuery(
        '<div class="popup zotero-popup" role="dialog" aria-labelledby="success" aria-hidden="true">'+
            '<div class="popup-content zotero-popup-content">'+
                '<div class="zotero-content">'+
                    '<h2 class="modal-title" id="success">Zitatquellen-Liste - '+collectionTitle+'</h2>'+
                '</div>'+
                '<div class="modal-body"></div>'+
                '<div class="modal-footer"></div>'+
            '</div>'+        
        '</div>'
    );

    // create the list of references
    var $list = jQuery('<div id="modal-list"></div>');
    $list.append(jQuery(
        '<label class="radio-label">Zitierstil:</label>'+
        '<label class="radio-inline"><input class="radio-btn" type="radio" name="optradio" id="citation1" checked>APA(7)</label>'+
        '<label class="radio-inline"><input class="radio-btn" type="radio" name="optradio" id="citation2">MLA(8)</label>'+
        '<label class="radio-inline"><input class="radio-btn" type="radio" name="optradio" id="citation3">Chicago A-D(17)</label><br><br>'+
        '<label class="search-label">Suche:</label><input class="search" placeholder="in Zitatquellen-Liste"/><br><br>'+
        '<table class="table table-striped">'+
            '<thead>'+
                '<tr>'+
                    '<td class="td-item-title">Titel</td>'+
                    '<td class="td-item-title">Autor</td>'+
                    '<td class="td-item-title" colspan="2">Datum</td>'+
                '</tr>'+
            '</thead>'+
            '<tbody class="list"></tbody>'+
        '</table>'
    ));

    if (!jQuery(xml).find("entry").length) {
        $itemsPopup.find('.modal-body').append("Es ist keine Zitatquelle verfügbar");
    } else {
        // add rows to the table
        jQuery(xml).find("entry").each(function(index) {

            // do not handle attachments entries
            var itemType = getEntryItemType(this);
            if (itemType != 'attachments') {

                // get the needed info from xml
                var entryTitle = getEntryTitle(this);
                var entryYear = getEntryYear(this);
                var authorName = getEntryAuthorNames(this);
                var creatorSummary = getEntryCreatorSummary(this);
                var itemKey = getEntryItemKey(this);
                var url = getEntryUrl(this);

                // add a row
                $list.find('tbody.list').append(
                    '<tr>'+
                        '<td class="title">'+entryTitle+'</td>'+
                        '<td class="author">'+creatorSummary+'</td>'+
                        '<td class="date">'+entryYear+'</td>'+
                    '</tr>'
                );

                // create the insert button
                var $insertButton = jQuery('<td><button type="button" class="btn btn-primary insert_reference" data-key="'+itemKey+'">Einfügen</button></td>');
                $list.find('tbody.list').find('tr').last().append($insertButton);

                // insert the reference on click
                $insertButton.on('click', function () {
                    var padeditor = require('ep_etherpad-lite/static/js/pad_editor').padeditor;
                    padeditor.ace.callWithAce(function (ace) {
                        var json =
                        '{'+
                            '"key": "'+itemKey+'",'+
                            '"date": "'+entryYear+'",'+
                            '"title": "'+entryTitle+'",'+
                            '"author": "'+authorName+'",'+
                            '"creator": "'+creatorSummary+'",'+
                            '"location": "unknown",'+
                            '"editor": "unknown"'+
                        '}';
                        if (authorName === "") { authorName = "AUTOR"; }
                        if (entryYear === "") { entryYear = "JAHR"; }
                        var optInsert = "";
                        if ($("#citation1").is(":checked"))
                            optInsert = ", " + entryYear;
                        if ($("#citation3").is(":checked"))
                            optInsert = " " + entryYear;    
                        var text = "("+creatorSummary + optInsert +")"; 
                        rep = ace.ace_getRep();
                        start = rep.selStart;
                        end = [rep.selStart[0], rep.selStart[1]+text.length];
                        ace.ace_replaceRange(rep.selStart, rep.selStart, text);
                        ace.ace_doInsertReference(json);
                    },'insertReference' , true);
                });
            }
        });
        $itemsPopup.find('.modal-body').append($list);
    }

    // create the go back to the choice modal button
    var $goBackButton = jQuery('<button type="button" class="btn btn-primary">Zurück</button>');
    $itemsPopup.find('.modal-footer').prepend($goBackButton);

    $goBackButton.on('click', function() {
        $itemsPopup.find('.modal-footer').addClass("ajax-loading");
        var url = urlPrefixUsersWithId+"/groups"+urlPostfixWithKey;
        jQuery.ajax({
            url : url
        })
        .done(function(xml){
            $itemsPopup.removeClass('popup-show');
            $choicePopup = createChoicePopup(xml);
            jQuery('body').append($choicePopup);
            $choicePopup.addClass('popup-show');
        })
        .fail(function(jqXHR, desc, errorThrown){
            $itemsPopup.removeClass('popup-show');
            $errorModal = createErrorModal();
            jQuery('body').append($errorModal);
            $errorModal.modal();
        });
    });

    return $itemsPopup;
}
