const MAX_URLDISPLAY_LENGTH = 48;
const VALID_PROTOCOLS = ["undef", "http", "https", "ftp", "file", "chrome", "chrome-extension", "safari-extension", "favorites"];
function standarizeURL(a, b) {
    if (!b) { b = MAX_URLDISPLAY_LENGTH }
    if (a.length > b) { return a.substr(0, b) + "..." } else { return a }
}
function getSite(a) { return "*." + getDomain(a) }
function getDomain(c) {
    var b = parseURL(c); var d = b[1].toLowerCase();
    if (d.substr(0, 4) == "www.") { d = d.substr(4) } return d
    return d;
}
//getDomainNew by Vishal
function getDomainNew(c) {
    var b = parseURL(c); var d = b[0] + "://" + b[1].toLowerCase();
    //Comment by Vishal // if ( d.substr( 0, 4 ) == "www." ) { d = d.substr( 4 ) } return d
    return d;
}
function formatSeconds(d) {
    var a = String(Math.floor(d / 3600));
    var c = String(Math.floor((d % 3600) / 60));
    var e = String(Math.floor(d % 60));
    function b(f) {
        return (f.length > 1 ? f : "0" + f)
    }
    return b(a) + ":" + b(c) + ":" + b(e)
}
function randomString(e) {
    var d = "023456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKMNOPQRSTUVWXYZ";
    var c = "";
    for (var b = 0; b < e; b++) { var a = Math.floor(Math.random() * d.length); c += d.charAt(a) }
    return c
}
function scrabbleString(e, a) {
    var d = e.length;
    var c = "";
    for (var b = 0; b < d; b++) {
        c += e.charAt(b) + a
    } return c
}
function removeUserPasswordFromURL(a) {
    if (a && a.indexOf("@") >= 0) {
        return validateAndCleanURL(a)
    } return a
}
function validateAndCleanURL(c) {
    var b = parseURL(c); if (DEBUG) {
        window.console.log("url parsed: " + b)
    }
    var j = b[0].toLowerCase();
    var f = b[1].toLowerCase();
    var h = b[2];
    var g = b[3];
    if (VALID_PROTOCOLS.indexOf(j) < 0) { return null }
    var d = f.indexOf("@");
    if (d >= 0) { f = f.substring(d + 1) }
    if (f && !f.match("^[0-9a-z*.-]+(:[0-9]+)?$")) { return null } var e = ""; if (j && j != "undef") { e += j + "://" } e += f; if (h) { e += "/" + h }
    if (g) { e += "?" + g } return e
}
function parseURL(a) {
    var g = ""; var d = ""; var f = ""; var e = "";
    var c = a.replace(/^ */, ""); var b = c.indexOf("://");
    if (b >= 0 && c.substring(0, b).match("^[a-zA-Z-]*$")) {
        g = c.substring(0, b); c = c.substring(b + 3)
    }
    else { g = "undef" } b = c.indexOf("/");
    if (b >= 0) {
        d = c.substring(0, b); c = c.substring(b + 1)
    }
    else {
        d = c; return new Array(g, d, f, e)
    }
    b = c.indexOf("?");
    if (b >= 0) {
        f = c.substring(0, b); e = c.substring(b + 1);
        return new Array(g, d, f, e)
    }
    else { f = c; return new Array(g, d, f, e) }
}
function cleanUpURL(c) {
    if (c.search(/^about:/i) == 0) { return c }
    var b = parseURL(c);
    var h = b[0];
    var e = b[1];
    var g = b[2];
    var f = b[3]; var d = "";
    if (h == "undef") { h = "http" }
    d = h + "://" + e + "/" + g + (f ? ("?" + f) : "");
    return d
}
function getMainPart(c) {
    var b = parseURL(c);
    var d = b[1].toLowerCase();
    var f = b[2]; var e = b[3];
    if (d.substr(0, 4) == "www.") { d = d.substr(4) }
    else {
        if (d.substr(0, 2) == "*.") { d = d.substr(2) }
    } return d + "/" + f + (e ? ("?" + e) : "")
}
function myRegexEscape(a) { return a.replace(/[[\]()+?.\\^$|]/g, "\\$&") }
function getRegexPatt(d) {
    var c = parseURL(d); var i = c[0]; var f = c[1]; var h = c[2];
    var g = c[3]; var b = new Array(4); if (i == "undef") { b[0] = null } else { b[0] = new RegExp("^" + i + "$", "i") }
    var e = ""; if (f.charAt(0) == "*" && f.charAt(1) == ".") { e = "(.*\\.|)"; f = f.substr(2) } f = myRegexEscape(f).replace(/\*/g, ".*"); b[1] = new RegExp("^" + e + f + "(:80)?$", "i"); if (h) { h = myRegexEscape(h).replace(/\*/g, ".*"); if (h.substr(-1) === "/") { b[2] = new RegExp("^" + h) } else { b[2] = new RegExp("^" + h + "(/|\\?|$)") } } else { b[2] = null } if (g) { g = myRegexEscape(g).replace(/\*/g, ".*"); b[3] = new RegExp("^" + g) } else { b[3] = null } return b
}
function compareURL(f, e) {
    var d = getMainPart(f);
    var c = getMainPart(e); return d.localeCompare(c)
}
function testRegexPatt(e, c) {
    var b = parseURL(c); for (var d = 0; d < 4; d++) { if (e[d] && !e[d].test(b[d])) { return false } }
    return true
}
function load_css(a) {
    var b = $('<link rel="stylesheet" type="text/css" />').attr("href", a); $("head").append(b)
} function trim(a) { return a.replace(/(\s+$)|(^\s+)/g, "") }
function getStartOfNextDay(a) {
    return new Date(a.getTime() - a.getHours() * 60 * 60 * 1000 - a.getMinutes() * 60 * 1000 - a.getSeconds() * 1000 - a.getMilliseconds() + millisecondsOfADay())
}
function millisecondsOfADay() { return 24 * 60 * 60 * 1000 }
function pad(b, a) { b = b.toString(); return b.length < a ? pad("0" + b, a) : b }
function normalizeTime(f, c) { if (c) { var e = /(\d{1,2}):(\d{2})/i; var g = f.match(e); if (!g || g.length != 3) { return false } var a = parseInt(g[1]); var d = parseInt(g[2]); if (a >= 0 && a < 24 && d >= 0 && d < 60) { return a.toString() + ":" + pad(d, 2) } } else { var e = /(\d{1,2}):(\d{2}) *([A|P]M)/i; var g = f.match(e); if (!g || g.length != 4) { return false } var a = parseInt(g[1]); var d = parseInt(g[2]); var b = g[3]; if (a > 0 && a <= 12 && d >= 0 && d < 60) { return a.toString() + ":" + pad(d, 2) + " " + b.toUpperCase() } } return null } String.prototype.hashCode = function () { var c = 0, a, b; if (this.length === 0) { return c } for (a = 0; a < this.length; a++) { b = this.charCodeAt(a); c = ((c << 5) - c) + b; c |= 0 } return c };
function getTimeToken() {
    var b = new Date; var a = new Date(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours(), b.getMinutes(), b.getSeconds()); return ("time token:" + a).hashCode()
}
function isTimeTokenFresh(a, c) {
    var f = c ? c : new Date; var e = new Date(f.getFullYear(), f.getMonth(), f.getDate(), f.getHours(), f.getMinutes(), f.getSeconds()); var b = new Date(f.getFullYear(), f.getMonth(), f.getDate(), f.getHours(), f.getMinutes(), f.getSeconds() - 1); return a == ("time token:" + e).hashCode() || a == ("time token:" + b).hashCode()
};