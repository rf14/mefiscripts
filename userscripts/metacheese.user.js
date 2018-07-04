// ==UserScript==
// @name           MetaCheese
// @namespace      http://www.sarahtisdale.com/gmscripts
// @description    Annotate MetaFilter posts with an indication of poster and commenter "age".  The idea is to identify posts from nicely aged posters - like fine cheese. 
// @include        http://metafilter.com/*
// @include        http://*.metafilter.com/*
// @include        https://metafilter.com/*
// @include        https://*.metafilter.com/*
// @version       0.3
// ==/UserScript==
//
// ChangeLog:
//  - 2011 Dec 23:  0.1
//         - Initial Version
//  - 2011 Dec 29:  0.2
//         - Larger indicator
//         - Use non-breaking-space to keep indicator with link text
//         - Prevent from matching "contribution" links on profiles
//         - Cosmetic changes
//  - 2011 Dec 29:  0.3
//         - Fix chrome's non-implemented GM_setValue/GM_getValue.
//           Used fix from here:
//             http://devign.me/greasemonkey-gm_getvaluegm_setvalue-functions-for-google-chrome/
//  - 2017 Dec: 0.4
//         - Add "https://*" includes
//         - Fix GM_setValue warning
//         - Make age indicator one &nbsp; wider

var debug = 0;

// Chrome implementations of GM_getValue/GM_setValue
if (!this.GM_getValue || (this.GM_getValue.toString && this.GM_getValue.toString().indexOf("not supported")>-1)) {
    this.GM_getValue=function (key,def) {
        return localStorage[key] || def;
    };
    this.GM_setValue=function (key,value) {
        return (localStorage[key]=value);
    };
    this.GM_deleteValue=function (key) {
        return delete localStorage[key];
    };
}

var i;

// Get stored max_user value
var max_user = parseInt(GM_getValue( "max_user", "1"));

// Get a list of all "user links"
var user_links = document.evaluate("//a[starts-with(@href,'/user/')]|//a[starts-with(@href,'http://www.metafilter.com/user/')]|//a[starts-with(@href,'https://www.metafilter.com/user/')]",
                                   document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

//Uncomment for debug info
//var user_links_rel = document.evaluate("//a[starts-with(@href,'/user/')]",
//                                   document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
//var user_links_http = document.evaluate("//a[starts-with(@href,'http://www.metafilter.com/user/')]",
//                                   document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
//var user_links_https = document.evaluate("//a[starts-with(@href,'https://www.metafilter.com/user/')]",
//                                   document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
//alert("all = "+ user_links.snapshotLength +", rel = "+user_links_rel.snapshotLength + ", http = " + user_links_http.snapshotLength + ", https = " + user_links_https.snapshotLength);


// Look for new max user number
//
for (i = 0; i < user_links.snapshotLength; i++) {
  var user_link = user_links.snapshotItem(i).href;
  var patt=/[0-9]+$/;
  var user_num = parseInt(user_link.match(patt));
  if ( user_num > max_user ) {
     max_user = user_num;
     GM_setValue( "max_user", String(max_user));
  }
  //alert("user_link: " + user_link + "; user_num: "+user_num + "; max_user: "+max_user+"; test: "+ (user_num>max_user)) ;
}
//alert("max user: " + max_user) ;


// Annotate every user link with a user-age indicator
//   - user-age = user_num / max_user_num * 255;
//
for (i = 0; i < user_links.snapshotLength; i++) {
  var user_link = user_links.snapshotItem(i);
  var patt=/[0-9]+$/;
  var numstr = user_link.href.match(patt);
  if ( !numstr ) {
    continue;
  }
  var user_num = parseInt(numstr);
  var hexh = (user_num/max_user * 0xff) & 0xff;
  //alert ('hexh='+hexh+');
  hexh = Number(hexh);
  hexh = hexh.toString(16);
  while ( hexh.length < 2 ) {
    hexh = '0'+hexh;
  }
  user_link.innerHTML = '<span style="background-color:#'+hexh+hexh+hexh+'">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;' + user_link.innerHTML;
}

