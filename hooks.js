'use strict';

var eejs = require('ep_etherpad-lite/node/eejs');
var fs = require('fs');

exports.eejsBlock_editbarMenuRight = function(hook_name, args, callback) {
  args.content = eejs.require("ep_zotero/templates/editbarButtons.ejs", {}, module)  + args.content;
  return callback();
};

exports.eejsBlock_styles = function(hook_name, args, callback) {
  args.content = args.content + eejs.require("ep_zotero/templates/styles.ejs", {}, module);
  return callback();
};

exports.eejsBlock_scripts = function(hook_name, args, callback) {
  args.content = args.content + eejs.require("ep_zotero/templates/scripts.ejs", {}, module);
  return callback();
};

exports.clientVars = function(hook, context, callback) {
  let zoteroApiInfo;
  try
  {
    const jsonString = fs.readFileSync("zotero_api.json");
    zoteroApiInfo = JSON.parse(jsonString);
  }
  catch (err)
  {
    console.log(err);
    return;
  }
  return callback({zoteroApiInfo});
};