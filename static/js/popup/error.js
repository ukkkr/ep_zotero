// Create error dialog
function createErrorModal(errorMessage) {
    var $modal = jQuery(
        '<div class="modal fade" id="error-modal" role="dialog" aria-labelledby="error" aria-hidden="true">'+
            '<div class="modal-dialog">'+
                '<div class="modal-content">'+
                    '<div class="modal-header">'+
                        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
                        '<h4 class="modal-title" id="error">Ein Problem ist aufgetreten</h4>'+
                    '</div>'+
                    '<div class="modal-body">'+
                        'Möglicherweise sind Ihre Zugangsdaten falsch oder die Zotero-API ist aktuell nicht verfügbar.'+
                    '</div>'+
                    '<div class="modal-footer">'+
                        '<button type="button" class="btn btn-default" data-dismiss="modal">Schließen</button>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'
    );

    // create the retry button
    var $retryButton = jQuery('<button type="button" class="btn btn-primary">Nochmal versuchen</button>');
    $modal.find('.modal-footer').append($retryButton);

    // display the form-modal when clicking on the retry button
    $retryButton.on('click', function () {
        $modal.modal('hide');
        var $formModal = createApiZoteroFormModal();
        jQuery('body').append($formModal);
        $formModal.modal();
    });

    $modal.on('hidden.bs.modal', function (e) {
        jQuery(this).remove();
    });
    return $modal;
}
