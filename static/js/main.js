jQuery(document).ready(function () {
    
    // global constants
    URL_PREFIX_USERS = "https://api.zotero.org/users/";
    URL_PREFIX_GROUPS = "https://api.zotero.org/groups/";
    URL_POSTFIX = "?content=html&key=";
    URL_POSTFIX_PARAM_END = "&end=true";
    
    //global variables
    zoteroApiUserId = "";
    zoteroApiUserKey = ""; 
    zoteroGroupId = "";
    urlPrefixUsersWithId="";
    urlPostfixWithKey="";
    
    // // Zotero button action
    jQuery(".zoteroButton").on('click', function () {
        urlPrefixUsersWithId = URL_PREFIX_USERS+zoteroApiUserId;
        urlPostfixWithKey = URL_POSTFIX+zoteroApiUserKey;
        // close open popup when clicking the button again
        if ($('.popup').hasClass('popup-show'))
        {
            $('.popup').removeClass('popup-show');
            return;
        }
        var $formPopup = createApiZoteroFormPopup();
        jQuery('body').append($formPopup);
        $formPopup.addClass('popup-show');
    });
});