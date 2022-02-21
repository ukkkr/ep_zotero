// Collection dialog to browse collection for items or other collections
function createCollectionPopup(userType, xml, url, numItems, collectionTitle) {
    var $collectionPopup = jQuery(
        '<div class="popup zotero-popup" role="dialog" aria-labelledby="success" aria-hidden="true">'+
            '<div class="popup-content zotero-popup-content">'+
                '<div class="zotero-content">'+
                    '<h2 class="modal-title" id="success">Durchsuchen - '+collectionTitle+'</h2>'+
                '</div>'+
                '<div class="modal-body"></div>'+
                '<div class="modal-footer"></div>'+
            '</div>'+        
        '</div>'
    );

    // create the list of collections in this table element
    var $table = jQuery('<table class="table table-striped"></table>');

    // add rows to the table
    jQuery(xml).find("entry").each(function(index) {
        var entry = this;
        // get the needed info from xml
        var entryTitle = getEntryTitle(this);
        var itemKey = getEntryItemKey(this);
        var numItems = getNumItems(this);

        // add one row
        $table.append(
            '<tr>'+
                '<td class="td-group">'+entryTitle+'</td>'+
                '<td></td>'+
            '</tr>'
        );

        // create the browse button
        var $button = jQuery('<button type="button" class="btn btn-primary browse_collection" data-key="'+itemKey+'">Durchsuchen</button>');
        $table.find('tr').last().find('td').last().append($button);

        $button.on('click', function () {
            $collectionPopup.find('.modal-footer').addClass("ajax-loading");
            var url = "error";
            if (userType == "groups") {
                url = URL_PREFIX_GROUPS+zoteroGroupId+"/collections/"+itemKey+"/collections"+urlPostfixWithKey+URL_POSTFIX_PARAM_END;
            } else if (userType == "users") {
                url = urlPrefixUsersWithId+"/collections/"+itemKey+"/collections"+urlPostfixWithKey+URL_POSTFIX_PARAM_END;
            }
            jQuery.ajax({
                url : url
            })
            .done(function(xml){
                if (hasCollections(xml)){ // we get the collection modal
                    $collectionPopup2 = createCollectionPopup(userType, xml, url, numItems, entryTitle);
                    jQuery('body').append($collectionPopup2);
                    $collectionPopup.removeClass('popup-show');
                    $collectionPopup2.addClass('popup-show');
                } else { // we get the items modal
                    url = url.replace(itemKey+"/collections", itemKey+"/items");
                    jQuery.ajax({
                        url : url
                    })
                    .done(function(xml){
                        // we need the items modal
                        $collectionPopup.removeClass('popup-show');
                        $itemsPopup = createItemsPopup(xml, entryTitle);
                        jQuery('body').append($itemsPopup);
                        var options = { valueNames: ['author', 'title', 'date'] };
                        var modalList = new List('modal-list', options);
                        $itemsPopup.addClass('popup-show');
                    })
                    .fail(function(jqXHR, desc, errorThrown){
                        $collectionPopup.removeClass('popup-show');
                        $errorModal = createErrorModal();
                        jQuery('body').append($errorModal);
                        $errorModal.modal();
                    });
                }
            })
            .fail(function(jqXHR, desc, errorThrown){
                $collectionPopup.removeClass('popup-show');
                $errorModal = createErrorModal();
                jQuery('body').append($errorModal);
                $errorModal.modal();
            });
        });
    });

    $collectionPopup.find('.modal-body').append($table);
    $table.prepend('<h3>Sammlungen</h3>');
    // add the list of items if there were any
    if (numItems > 0) {
        url = url.replace("/collections\?end=true", "/items?");
        jQuery.ajax({
            url : url
        })
        .done(function(xml){
            // create the list of references
            var $list = jQuery('<div id="modal-list"></div>');
            $list.append(jQuery(
                '<h5>Referenzen</h5>'+
                '<table class="table table-striped">'+
                    '<thead>'+
                        '<tr>'+
                            '<td>title</td>'+
                            '<td>author</td>'+
                            '<td colspan="2">Date</td>'+
                        '</tr>'+
                    '</thead>'+
                    '<tbody class="list"></tbody>'+
                '</table>'
            ));

            // add rows to the table
            jQuery(xml).find("entry").each(function(index){
                // do not handle attachments entries
                var itemType = getEntryItemType(this);
                if (itemType != 'attachments') {

                    // get the needed info from xml
                    var entryTitle = getEntryTitle(this);
                    var entryYear = getEntryYear(this);
                    var authorName = getEntryAuthorName(this);
                    var itemKey = getEntryItemKey(this);
                    var url = getEntryUrl(this);

                    // add a row
                    $list.find('tbody.list').append(
                        '<tr>'+
                            '<td class="title">'+entryTitle+'</td>'+
                            '<td class="author">'+authorName+'</td>'+
                            '<td class="date">'+entryYear+'</td>'+
                        '</tr>'
                    );

                    // create the insert button
                    var $insertButton = jQuery('<td><button type="button" class="btn btn-primary insert_reference" data-key="'+itemKey+'">Einfügen</button></td>');
                    $list.find('tbody.list').find('tr').last().append($insertButton);

                    // insert the reference on click
                    $insertButton.on('click', function (){
                        var padeditor = require('ep_etherpad-lite/static/js/pad_editor').padeditor;
                        padeditor.ace.callWithAce(function (ace) {
                            var json =
                                '{'+
                                    '"key": "'+itemKey+'",'+
                                    '"date": "'+entryYear+'",'+
                                    '"title": "'+entryTitle+'",'+
                                    '"author": "'+authorName+'",'+
                                    '"location": "unknown",'+
                                    '"editor": "unknown"'+
                                '}';
                                if (authorName === "") { authorName = "AUTOR"; }
                                if (entryYear === "") { entryYear = "JAHR"; }
                                var text = "("+authorName+", "+entryYear+")";
                                // rep contains informations about the cursor location
                                rep = ace.ace_getRep();
                                start = rep.selStart;
                                end = [rep.selStart[0], rep.selStart[1]+text.length];
                                ace.ace_replaceRange(rep.selStart, rep.selStart, text);
                                ace.ace_doInsertReference(json);
                                $collectionPopup.modal('hide');
                            },'insertReference' , true);
                        });
                }
            });

            $collectionPopup.find('.modal-body').append($list);
        })
        .fail(function(jqXHR, desc, errorThrown){
            $collectionPopup.removeClass('popup-show');
            $errorModal = createErrorModal();
            jQuery('body').append($errorModal);
            $errorModal.modal();
        });
    }

    // create the go back to the choice modal button
    var $goBackButton = jQuery('<button type="button" class="btn btn-primary">Zurück</button>');
    $collectionPopup.find('.modal-footer').prepend($goBackButton);

    $goBackButton.on('click', function() {
        // set the ajax-loader
        $collectionPopup.find('.modal-footer').addClass("ajax-loading");
        // set user id and key
        var url = urlPrefixUsersWithId+"/groups"+urlPostfixWithKey;
        jQuery.ajax({
            url : url
        })
        .done(function(xml){
            $collectionPopup.removeClass('popup-show');
            $choicePopup = createChoicePopup(xml);
            jQuery('body').append($choicePopup);
            $choicePopup.addClass('popup-show');
        })
        .fail(function(jqXHR, desc, errorThrown){
            $collectionPopup.removeClass('popup-show');
            $errorModal = createErrorModal();
            jQuery('body').append($errorModal);
            $errorModal.modal();
        });
    });

    return $collectionPopup;
}
