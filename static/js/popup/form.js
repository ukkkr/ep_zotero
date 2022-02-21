function createApiZoteroFormPopup() {

    // the former dialog with input of Zotero API is skipped after short execution and check of first API call 
    var $formPopup = jQuery(

        '<div class="popup zotero-popup" role="dialog" aria-labelledby="success" aria-hidden="true">'+
            '<div class="popup-content zotero-popup-content">'+
                '<h2 id="success">Ihre Zitatquellen aus Zotero holen</h2>'+
                '<div class="zotero-body"></div>'+
                '<div class="modal-footer">'+
                    '<button type="button" class="btn btn-default" id="close">Zotero schließen</button>'+
                '</div>'+
            '</div>'+
        '</div>')
 
    var $closer=$formPopup.find('#close');
    $closer.on('click', function() {
        $formPopup.removeClass('popup-show');
    });

    $formPopup.find('.modal-footer').addClass("ajax-loading");
    var url = urlPrefixUsersWithId+"/groups"+urlPostfixWithKey;
    jQuery.ajax({
        url : url
    })
    .done(function(xml){
        $formPopup.removeClass('popup-show');
        $choicePopup = createChoicePopup(xml);
        jQuery('body').append($choicePopup);
        $choicePopup.addClass('popup-show');
    })
    .fail(function(jqXHR, desc, errorThrown){
        $formPopup.modal('hide');
        $errorModal = createErrorModal();
        jQuery('body').append($errorModal);
        $errorModal.modal();
    });

    return $formPopup;
}

function citationStyleFormModal() {
var $formModal = jQuery(
    '<div class="modal fade" role="dialog" aria-labelledby="success" aria-hidden="true">'+
        '<div class="modal-dialog">'+
            '<div class="modal-content">'+
                '<div class="modal-header">'+
                    '<h2 class="modal-title" id="success">Literaturverzeichnis (am Textende): Auswahl des Zitierstils</h2>'+
                '</div>'+
                '<div class="modal-body">'+
                    '<label class="radio-label">Zitierstil:</label>'+
                    '<label class="radio-inline"><input class="radio-btn" type="radio" name="refradio1" id="refcitation1" checked>APA(7)</label>'+
                    '<label class="radio-inline"><input class="radio-btn" type="radio" name="refradio2" id="refcitation2">MLA(8)</label>'+
                    '<label class="radio-inline"><input class="radio-btn" type="radio" name="refradio3" id="refcitation3">Chicago A-D(17)</label><br>'+
                '</div>'+
                '<div class="modal-footer">'+
                    '<button type="button" class="btn btn-primary" id="insertReferencesButton">Literaturverzeichnis einfügen</button>'+
                    '<button type="button" class="btn btn-default" data-dismiss="modal">Schließen</button>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</div>');

    $formModal.on('hidden.bs.modal', function () {
        jQuery(this).remove();
    });
    return $formModal;
}