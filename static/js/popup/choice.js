// Choice dialog for selection between own library and group libraries
function createChoicePopup(xml) {
    var $choicePopup = jQuery(
        '<div class="popup zotero-popup" role="dialog" aria-labelledby="success" aria-hidden="true">'+
            '<div class="popup-content zotero-popup-content">'+
                '<h2 id="success">Ihre Zitatquellen aus Zotero durchsuchen </h2>'+
                '<div class="zotero-content">'+
                    '<div class="user-library"><h3>Meine Bibliothek</h3></div>'+
                    '<div class="groups-libraries"><h3>Gruppen-Bibliotheken</h3></div>'+
                '</div>'+
                '<div class="modal-footer">'+
                    '<button type="button" class="btn btn-default" id="close">Zotero schließen</button>'+
                '</div>'+
            '</div>'+
        '</div>'
    );

    var $closer=$choicePopup.find('#close');
    $closer.on('click', function() {
        $choicePopup.removeClass('popup-show');
    });

    function loadAppropriatePopup(userType, url, xml, title) {
        if (hasCollections(xml)) { // we get the collection modal
            $collectionModal = createCollectionPopup(userType, xml, url, 0 , title);
            jQuery('body').append($collectionModal);
            $choicePopup.removeClass('popup-show');
            $collectionModal.addClass('popup-show');
        } else { // we get the items
            url = url.replace('collections/top', 'items');
            jQuery.ajax({
                url : url
            })
            .done(function(xml){
                // we need the items modal
                $itemsModal = createItemsPopup(xml, title);
                jQuery('body').append($itemsModal);
                var options = { valueNames: ['author', 'title', 'date'] };
                var modalList = new List('modal-list', options);
                $choicePopup.removeClass('popup-show');
                $itemsModal.modal();
            })
            .fail(function(jqXHR, desc, errorThrown){
                $errorModal = createErrorModal();
                jQuery('body').append($errorModal);
                $choicePopup.removeClass('popup-show');
                $errorModal.modal();
            });
        }
    }

    // create button for the user library
    var $libraryCallButton = jQuery('<button type="button" class="btn btn-primary">Auf meine Bibliothek zugreifen</button>');
    $choicePopup.find('.user-library').append($libraryCallButton);

    // ajax request on click
    $libraryCallButton.on('click', function () {
        $choicePopup.find('.modal-footer').addClass("ajax-loading");
        // collection or items
        var url = urlPrefixUsersWithId+ "/collections/top"+urlPostfixWithKey;
        jQuery.ajax({
            url : url
        })
        .done(function(xml){
            loadAppropriatePopup("users", url, xml, "Meine Bibliothek");
        })
        .fail(function(jqXHR, desc, errorThrown){
            $choicePopup.removeClass('popup-show');
            $errorModal = createErrorModal();
            jQuery('body').append($errorModal);
            $errorModal.modal();
        });
    })

    // create the list of groups
    $groupLibrariesList = jQuery('<table class="table"></table>');

    // add li to the list
    jQuery(xml).find("entry").each(function(index) {

        // get the needed info from xml
        var entryTitle = getEntryTitle(this);
        zoteroGroupId = getEntryGroupId(this);

        // add a row
        $groupLibrariesList.append(
            '<tr>'+
                '<td class="td-group">'+entryTitle+'</td>'+
                '<td></td>'+
            '</tr>'
        );

        // create the button to browser a group collection
        var $browseButton = jQuery('<button type="button" class="btn btn-primary" data-group-id="'+zoteroGroupId+'">Durchsuchen</button>');
        $groupLibrariesList.find('tr').last().find('td').last().append($browseButton);

        // ajax request on click
        $browseButton.on('click', function () {
            $choicePopup.find('.modal-footer').addClass("ajax-loading");
            zoteroGroupId = jQuery(this).attr("data-group-id");
            var url = URL_PREFIX_GROUPS+zoteroGroupId+"/collections/top"+urlPostfixWithKey;
            console.log(url);
            jQuery.ajax({
                url : url
            })
            .done(function(xml){
                loadAppropriatePopup("groups", url, xml, entryTitle);
            })
            .fail(function(jqXHR, desc, errorThrown){
                $choicePopup.removeClass('popup-show');
                $errorModal = createErrorModal();
                jQuery('body').append($errorModal);
                $errorModal.modal();
            });
        });
    });

    $choicePopup.find('.groups-libraries').append($groupLibrariesList);

    return $choicePopup;
}

