// Utilities

/**
 * Replace all occurences of a string
 *
 * @param string
 * @param find
 * @param replace
 * @returns string
 */
function replaceAll(string, find, replace) {
    return string.replace(new RegExp(find, 'g'), replace);
}

/**
 * Has collections
 * Check whether or not a group, user or collection has sub collections
 */
function hasCollections(xml) {
    return jQuery(xml).has("entry").length > 0;
}

/**
 * Get the entry title
 * Fixes errors when the text contains single quote & remove html tags from titles
 */
function getEntryTitle(entry) {

    var entryTitle = jQuery(entry).find('title').text();
    // escape double quotes
    var cleanEntryTitle = replaceAll(entryTitle, "\"", "\\\"");
    return cleanEntryTitle;
}

/**
 * Get the entry date
 * Format the existing date
 */
function getEntryDate(entry) {
    var date = jQuery(entry).find('content tr.date td').text();
    var splittedDate = date.split('T');
    return splittedDate[0];
}

/**
 * Get the entry year
 */
function getEntryYear(entry) {
    var date = getEntryDate(entry);
    var year = date.substring(0,4);
    return year;
}

/**
 * Get the entry author(s)
 */
function getEntryAuthorNames(entry) {
    var authorNames="";
    // jQuery(entry).find('content tr.creator td').text();
    jQuery(entry).find('content tr.creator td').each(function() { 
        authorNames+=$(this).text()+";";
    });
    return authorNames;
}

/**
 * Get the item key of an entry
 */
function getEntryItemKey(entry) {
    var itemKey = jQuery(entry).find('zapi\\:key, key').text();
    return itemKey;
}

/**
 * Get creator summary of an entry
 */
function getEntryCreatorSummary(entry) {
    var itemKey = jQuery(entry).find('zapi\\:creatorSummary, creatorSummary').text();
    return itemKey;
}


/**
 * Get the item type of an entry
 */
function getEntryItemType(entry) {
    var itemType = jQuery(entry).find('zapi\\:itemType, itemType').text();
    return itemType;
}

/**
 * Get the url type of an entry
 */
function getEntryUrl(entry) {
    var url = jQuery(entry).find('content tr.url td').text();
    return url;
}

/**
 * Get the id of the groupe of an entry
 */
function getEntryGroupId(entry) {
    var groupId = jQuery(entry).find('zapi\\:groupID, groupID').text();
    return groupId;
}

/**
 * Get the number of items of a collection
 */
function getNumItems(entry) {
    var numItem = jQuery(entry).find('zapi\\:numItems, numItems').text();
    return numItem;
}
