var _, $, jQuery;
var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');

// Enum equivalent for currently implemented citation styles
const CITATION_STYLE = Object.freeze({
    NONE: 0,
    APA: 1,
    MLA: 2,
    CHICAGO: 3
});

/**
 * aceAttribsToClasses
 *
 * Set the zotero-reference:'json' class where the zotero_ref attribute is set
 */
function aceAttribsToClasses(hook, context){
    if(context.key == 'zotero_ref'){
        return ['zotero-reference:'+context.value]; // set 'zotero-reference' class
  }
}

/**
 * aceCreateDomLine
 * 
 * Add a em tag with data-xxx attributes on zotero-reference:'json' lines
 */
function aceCreateDomLine(name, context){
    var cls = context.cls;
    var referenceType = /zotero-reference:\{.*\}/.exec(cls); // check if the line contains the wanted class
    if (referenceType) {
        var tag = 'zotero-reference:';
        var author, date, title, creator;
        var jsonString = referenceType[0].substring(tag.length);
        var jsonObj = $.parseJSON(jsonString);
        var dataLine = "";
        for (key in jsonObj) {
            if (key === 'author') { author = jsonObj[key]; }
            if (key === 'date') { date = jsonObj[key]; }
            if (key === 'title') { title = jsonObj[key]; }
            if (key === 'creator') { creator = jsonObj[key]; }
            dataLine += 'data-'+key+'="'+jsonObj[key]+'" ';
        }

         var modifier = {
            extraOpenTags: '<em style="text-shadow: 1px 1px 3px" title="'+title+', '+date+'" '+dataLine+'>',
            //extraOpenTags: '<em title="'+title+', '+date+'" '+dataLine+'>',
            extraCloseTags: '</em>',
            cls: cls
        };

        return [modifier];
    } else {
        return [];
    }
};

/**
 * Insert a reference
 * 
 * Find out which lines are selected and assign them the 'zotero_ref' attribute.
 */
function doInsertReference(json){
    var rep = this.rep,
    documentAttributeManager = this.documentAttributeManager;
    if (!(rep.selStart && rep.selEnd)){
        return;
    }
    documentAttributeManager.setAttributesOnRange(start, end, [
        ['zotero_ref', json]
    ]);
}

/**
 * aceInitialized
 * 
 * Once ace is initialized, we set ace_doInsertReference and bind it to the context
 */
function aceInitialized(hook, context)
{
    var editorInfo = context.editorInfo;
    editorInfo.ace_doInsertReference = _(doInsertReference).bind(context);
    const zoteroApi = clientVars.zoteroApiInfo;
    if (zoteroApi)
    {
        zoteroApiUserId = zoteroApi.UserId;
        zoteroApiUserKey = zoteroApi.UserKey;
    }  
    // else TODO Error msg
}

function postAceInit (hook, context) {

    padId = context.pad.getPadId();
    if (padId!=null && padId.length > 0 && padId.startsWith("r."))
    {
        $("#refBtn").hide();
        $("#zotBtn").hide();
        return;
    }
        
    
    let rep;
    
    context.ace.callWithAce((ace) => {
        const padOuter = $('iframe[name="ace_outer"]').contents();
        const padInner = padOuter.find('iframe[name="ace_inner"]').contents();
        var padeditor = require('ep_etherpad-lite/static/js/pad_editor').padeditor;
        rep = ace.ace_getRep();
      
        // catch an modify the COPY event in padeditor
        padInner.contents().on('copy', (e) => {
            saveClipboardData(e,rep);
        });

        // catch an modify the CUT event in padeditor
        padInner.contents().on('cut', (e) => {
            saveClipboardData(e,rep);
            rep = ace.ace_getRep();
            ace.ace_replaceRange(rep.selStart,rep.selEnd, "");
        });

        // catch an modify the PASTE event in padeditor
        padInner.contents().on('paste', (e) => {
            let dataString= e.originalEvent.clipboardData.getData('objectZotero');
            if (dataString && dataString != "")
            {
                const zoteroEntry = JSON.parse(dataString);
                const entryText = (zoteroEntry != "") ? zoteroEntry.text : "No PASTE text";
                padeditor.ace.callWithAce(function (ace) {
                    rep = ace.ace_getRep();
                    start = rep.selStart;
                    end = [rep.selStart[0], rep.selStart[1]+entryText.length];
                    ace.ace_replaceRange(rep.selStart, rep.selStart, entryText);
                    ace.ace_doInsertReference(dataString);
                },'insertReference' , true);
            }
        });
    });
      
    // insert references cited with preceding selection of a citation style
    $('body').on('click', '.referencesButton', () => {
        $formModal=citationStyleFormModal();
        $formModal.modal();  
        $formModal.on('click', '#insertReferencesButton', () => {
            $formModal.modal('hide');
               context.ace.callWithAce((ace) => {
                  rep = ace.ace_getRep();
                  // get the innerframe containing all text and citations
                  innerFrameBody = $('iframe').contents().find('iframe').contents().find('#innerdocbody');
            });
        
            citationStyle = CITATION_STYLE.NONE; 
            citationStyle = ($("#refcitation1").is(":checked")) ? CITATION_STYLE.APA : ($("#refcitation2").is(":checked")) ? CITATION_STYLE.MLA : CITATION_STYLE.CHICAGO;

            // get text to insert references into document
            var insertText = createReferences(innerFrameBody, citationStyle);
            const padEditor = require('ep_etherpad-lite/static/js/pad_editor').padeditor;
            let lastLineNumber = rep.lines.length() - 1;
            len = rep.lines.atIndex(lastLineNumber).text.length;
            padEditor.ace.replaceRange([lastLineNumber, 0], [lastLineNumber, len], insertText);    
            padEditor.ace.focus();
        });  
   });
}

// on cut or copy event in Chrome/Firefox save clipboard data -> decide if a zotero-reference is included 
// -> save its citation data to clipboard in a specific data value
function saveClipboardData(cut_copy_event,selectedRep)
{
    if (browser.chrome || browser.firefox)
    {
        zTarget =cut_copy_event.target;
        domMap=zTarget.dataset;
        // check two fields to be sure of a zotero reference
        if (domMap.hasOwnProperty('key') && domMap.hasOwnProperty('creator'))
        {
            var jsonString =
            '{'+
                '"key": "'+domMap.key+'",'+
                '"date": "'+domMap.date+'",'+
                '"title": "'+domMap.title+'",'+
                '"author": "'+domMap.author+'",'+
                '"creator": "'+domMap.creator+'",'+
                '"location": "unknown",'+
                '"editor": "unknown",'+
                '"text":"'+zTarget.innerText+'"'+
            '}';
            cut_copy_event.originalEvent.clipboardData.setData('objectZotero', jsonString);
        }
        else
        {
            // empty Zotero object on traditional cut/copy
            cut_copy_event.originalEvent.clipboardData.setData('objectZotero', ""); 
            // do normal text save
            copyText = getSelectedText(selectedRep);
            cut_copy_event.originalEvent.clipboardData.setData('text/plain', copyText); 
        }
        // prevent default behaviour of cut/copy
        cut_copy_event.preventDefault();    
    }
}

// Get a string representation of the text selected on the editor. This method is taken from the plugin ep_comments_page.
function getSelectedText(rep) {

    const selectedTextLines = [];
    const lastLine = rep.selEnd[0];
    for (let lineNumber = rep.selStart[0]; lineNumber <= lastLine; ++lineNumber) {
      const line = rep.lines.atIndex(lineNumber);
      const selStartsAfterLine = rep.selStart[0] > lineNumber ||
        (rep.selStart[0] === lineNumber && rep.selStart[1] >= line.text.length);
      if (selStartsAfterLine) continue; // Nothing in this line is selected.
      const selEndsBeforeLine = rep.selEnd[0] < lineNumber ||
        (rep.selEnd[0] === lineNumber && rep.selEnd[1] <= 0);
      if (selEndsBeforeLine) continue; // Nothing in this line is selected.
      const selStartsBeforeLine = rep.selStart[0] < lineNumber || rep.selStart[1] < 0;
      const posStart = selStartsBeforeLine ? 0 : rep.selStart[1];
      const selEndsAfterLine = rep.selEnd[0] > lineNumber || rep.selEnd[1] > line.text.length;
      const posEnd = selEndsAfterLine ? line.text.length : rep.selEnd[1];
      // If the selection includes the very beginning of line, and the line has a line marker, it
      // means the line marker was selected as well. Exclude it from the selected text.
      selectedTextLines.push(
        line.text.substring((posStart === 0 && (line.lineMarker === 1)) ? 1 : posStart, posEnd));
    }
    return selectedTextLines.join('\n');
  };

// pass the html code and get a references text
function createReferences(innerframebody, citationstyle)
{
    var retString = "Literaturverzeichnis\n";
    var aMatches = [];
  
    // get all data-key values
    var regEx = new RegExp('data-key="(.*?)"','gi');
    innerframebody.html().replace(regEx,function(s,match){aMatches.push(match);});
    
    if (aMatches.length === 0)
        return retString + "<Keine Zitate gefunden!>";

    // remove duplicates
    var filteredMatches = aMatches.filter(function(item, index) {
        if (aMatches.indexOf(item) == index)
            return item;
    });
  
    // loop over the unique Zoter0 data-keys and grab their data from the <em>...</em> section
    for (let i = 0; i < filteredMatches.length; i++)
    {
        regEx=new RegExp('<em.*?data-key="'+filteredMatches[i]+'".*?data-date="(?<year>.*?)".*?data-title="(?<title>.*?)".*?data-author="(?<author>.*?)".*?data-creator="(?<creator>.*?)".*?>');
        aGroups=regEx.exec(innerframebody.html());
        if (aGroups!=null)
        {
            sAuthor=aGroups.groups.author;
            // Citation styles for citation references
            switch (citationstyle)
            {
                case CITATION_STYLE.APA:
                    firstNameInitial = (sAuthor!=null && sAuthor!="") ? sAuthor.charAt(0) : ""; 
                    retString += "\n" + aGroups.groups.creator+ ", "+ firstNameInitial + ". (" + aGroups.groups.year + "). " + aGroups.groups.title + ".";
                break;

                case CITATION_STYLE.MLA:
                    aAuthor= (sAuthor!=null && sAuthor!="") ? sAuthor.split(' ') : ""; 
                    firstName = (aAuthor.length > 0) ? aAuthor[0] : "";
                    retString += "\n" + aGroups.groups.creator + ", "+firstName + ". "+ aGroups.groups.title + ". " + aGroups.groups.year + ".";
                break;

                case CITATION_STYLE.CHICAGO:
                    aAuthor= (sAuthor!=null && sAuthor!="") ? sAuthor.split(' ') : ""; 
                    firstName = (aAuthor.length > 0) ? aAuthor[0] : "";
                    retString += "\n" + aGroups.groups.creator + ", " + firstName+ ". " + aGroups.groups.year + ". "+ aGroups.groups.title + ".";
                break;
                
                default:
                    alert("Error: found invalid citation style number (check your radiobutton selection) -> " + citationstyle);
            }
        }
    }
    return retString;
}

// Export all hooks
exports.aceInitialized = aceInitialized;
exports.aceAttribsToClasses = aceAttribsToClasses;
exports.aceCreateDomLine = aceCreateDomLine;
exports.postAceInit = postAceInit;