var settings = getSettings();
var defaultBlockPage = "https://www.google.com/";
var chrome_referrers = {};
var urlRegexListBlocked;
var urlRegexListAllowed;
var redirectURLRegex;
var doNotTrackURLRegex;
var sysWhiteList = [ "https://www.facebook.com/sharer/sharer.php?app_id=389372931225032", "https://www.facebook.com/login.php?next=https%3A%2F%2Fwww.facebook.com%2Fsharer%2Fsharer.php%3Fapp_id%3D389372931225032", "https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fsharer%2Fsharer.php%3Fapp_id%3D389372931225032", "https://www.paypal.com/donate/?token=SVtz16Nh1uAR4jlNS1neAuUg8FiBVVMpeeQUziX51TPHGncjzhmYxsqLSwWl9dVi7tBGXm" ];
function updateGlobalVars( a ) {
    urlRegexListBlocked = getRegexList( a.blacklist );
    urlRegexListAllowed = getRegexList( a.whitelist.concat( sysWhiteList ) );
    redirectURLRegex = getRegexPatt( a.blockurl ); doNotTrackURLRegex = getRegexPatt( a.doNotTrackSite )
}
updateGlobalVars( settings );
function getRedirectURL( a ) {
    return ( settings.blockurlUseDefault ? ( defaultBlockPage ) : cleanUpURL( settings.blockurl ) )
}
var lockdownSettings = new lockdownSettings();
var quota = new timeQuota( settings );
var tracker = new TimeTracker();
var currURL = "";
var currLinkToUrl = undefined;
var lastcheckTime = 0;
var checkInterval = 1;
var currURLTrackedWithQuota = false;
var isIdle = false;
var currURLTracked = false;
var currURLIncognito = false;
var timer = null;
var showContextMenu = false;
var showStatusBar = false;
var safariPopover = null;
var chromeLostFocusStart = null;
var inLockdown = false;
$( document ).ready( function doc_ready() {
    if ( typeof myextension == "undefined" ) { window.console.log( "extension.js is not loaded" ); setTimeout( doc_ready, 1 ); return }
    myextension.loadHTMLBody( function () {
        if ( SAFARI ) { safari.application.addEventListener( "contextmenu", handleContextMenu, false ); safari.application.addEventListener( "command", performCommand, false ); safari.application.addEventListener( "validate", validateItem, false ); safari.application.addEventListener( "popover", popoverHandler, true ); safari.extension.settings.addEventListener( "change", configChanged, false ); showContextMenu = safari.extension.settings.enableContextMenu }
        if ( CHROME ) {
            chrome.contextMenus.create( {
                title: myextension.getMessage( "Add Entire Site to Block List" ),
                contexts: [ "page" ],
                onclick: function ( b, a ) { addEntireSiteCommand( a ) },
                documentUrlPatterns: [ "http://*/*", "https://*/*" ],
            }
            );
            chrome.contextMenus.create( {
                title: myextension.getMessage( "Add Site to Block List..." ),
                contexts: [ "page" ],
                onclick: function ( b, a ) { addSiteCommand( a ) }, documentUrlPatterns: [ "http://*/*", "https://*/*" ],
            } );
            chrome.contextMenus.create( {
                title: myextension.getMessage( "WasteNoTime Settings..." ),
                contexts: [ "page" ],
                onclick: function ( b, a ) { showSettings() },
            } );
            chrome.tabs.onActivated.addListener( function ( a ) {
                if ( DEBUG ) { window.console.log( "Got active tab change event." ) }
            } );
            chrome.windows.onFocusChanged.addListener(
                function ( a ) {
                    if ( DEBUG ) {
                        window.console.log( "Got window focus change event -- window id:" + a )
                    }
                    if ( a == chrome.windows.WINDOW_ID_NONE ) {
                        chromeLostFocusStart = new Date().getTime()
                    }
                    else { chromeLostFocusStart = null }
                } );
            chrome.tabs.onRemoved.addListener( function ( b, a ) {
                delete chrome_referrers[ b ];
                //alert( "THE SITE WHICH IS REMOVED from object keys IS" + Object.keys( chrome_referrers ) + "the site remove from obj values" + Object.values( chrome_referrers ) );
                console.log( "my object" + JSON.stringify( a ) );
                console.log( "CHROME_REFERRES" + JSON.stringify( chrome_referrers ) );
                if ( DEBUG ) { window.console.log( "Got tab removed [" + b + "]. Remaining tabs:" + Object.keys( chrome_referrers ) ) }
            } );
            chrome.tabs.onReplaced.addListener( function ( b, a ) { delete chrome_referrers[ a ]; if ( DEBUG ) { window.console.log( "Got tab replaced [" + a + "]. Remaining tabs:" + Object.keys( chrome_referrers ) ) } } )
        }
        myextension.addMessageListener( respondToMessage ); createPopover();
        timer = setTimeout( checkActiveTab, checkInterval * 1000 )
    } )
} );
function supportPopover() {
    return ( CHROME || typeof safari.extension.createPopover == "function" )
}
function getVisiblePopoverWindow() {
    if ( SAFARI ) {
        if ( safariPopover && safariPopover.visible ) { return safariPopover.contentWindow }
        else { return null }
    } else {
        return chrome.extension.getViews( { type: "popup" } )[ 0 ]
    }
}
function createPopover() {
    if ( CHROME ) { chrome.browserAction.setPopup( { popup: "popover.html" } ) }
    else { if ( supportPopover() ) { safariPopover = safari.extension.createPopover( "statusPopover", myextension.getURL( "popover.html" ), 400, 300 ) } }
}
function installPopover( a ) { if ( CHROME ) { return } if ( safariPopover && !a.popover ) { a.popover = safariPopover; a.command = null } } function hidePopover() { if ( CHROME ) { getVisiblePopoverWindow().close(); return } if ( safariPopover ) { safariPopover.hide() } }
function openPage( a ) {
    myextension.openTab( a )

}
function showSettings() {
    var a = myextension.getURL( "view.html" );
    myextension.openTab( a )
} function showlogin() {
    var a = myextension.getURL( "view.html#login" );
    myextension.openTab( a )
}
function showTimeTracker() {
    var a = myextension.getURL( "view.html#timeTracker" );
    myextension.openTab( a )
}
function instantLockdown() {
    var a = myextension.getURL( "view.html#lockdown" );
    myextension.openTab( a )
}
function addSiteCommand( b ) {
    if ( b ) { var a = prompt( myextension.getMessage( "Add the following site to Block List" ) + "\n", removeUserPasswordFromURL( b.url ) ); if ( a ) { addURLToBlockList( a ); updateToolbarIcon() } }
    else { myextension.getVisibleTab( function ( c ) { if ( c ) { addSiteCommand( c ) } } ) }
}
function addEntireSiteCommand( b ) {
    if ( b ) {
        var c = getSite( b.url );
        var a = confirm( myextension.getMessage( "Add the entire site to the Block List" ) + "\n\n        " + c + "\n" ); if ( a == true ) {
            addURLToBlockList( c ); updateToolbarIcon()
        }
    }
    else {
        myextension.getVisibleTab( function ( d ) { if ( d ) { addEntireSiteCommand( d ) } } )
    }
}
function validateAddSiteCommand( b, a ) {
    myextension.getVisibleTab( function ( c ) { if ( c && isBlockable( c.url ) ) { if ( b ) { b() } } else { if ( a ) { a() } } } )
}
function isBlockable( a ) { return a && !( a.indexOf( myextension.getURL( "" ) ) === 0 || testRegexPatt( redirectURLRegex, a ) ) && !a.startsWith( defaultBlockPage ) }
function shouldUseReferrer( b ) {
    var a = getMatchingBlockedSite( b );
    if ( a ) { return shouldIncludeChildren( settings, a ) } return false
}
function isOnBlockList( a ) { return Boolean( getMatchingBlockedSite( a ) ) }
function isAllowed( a ) {
    for ( var b in urlRegexListAllowed ) {
        if ( testRegexPatt( urlRegexListAllowed[ b ], a ) ) { return true }
    } return false
}
function getMatchingAllowedSite( b ) {
    for ( var a in urlRegexListAllowed ) {
        if ( testRegexPatt( urlRegexListAllowed[ a ], b ) ) { return a }
    } return null
}
function getMatchingBlockedSite( b ) {
    for ( var a in urlRegexListBlocked ) {
        if ( testRegexPatt( urlRegexListBlocked[ a ], b ) ) { return a }
    } return null
}
function handleContextMenu( a ) {

    a.contextMenu.appendContextMenuItem( "addSiteDefault", myextension.getMessage( "Add Entire Site to Block List" ), "add-entire-site" );
    a.contextMenu.appendContextMenuItem( "addSiteItem", myextension.getMessage( "Add Site to Block List..." ), "add-site" );
    a.contextMenu.appendContextMenuItem( "showSettings", myextension.getMessage( "WasteNoTime Settings..." ), "show-settings" )
    a.contextMenu.appendContextMenuItem( "showlogin", myextension.getMessage( "WasteNoTime Login..." ), "show-login" )
}
function performCommand( a ) {
    if ( a.command === "add-site" ) {
        addSiteCommand()
    }
    else {
        if ( a.command === "add-entire-site" ) { addEntireSiteCommand() } else {
            if ( a.command === "show-settings" ) { showSettings() }
            if ( a.command === "show-login" ) { showlogin() }
        }
    }
} function configChanged( a ) {
    if ( a.key == "enableContextMenu" ) { showContextMenu = safari.extension.settings.enableContextMenu } else { if ( a.key == "enableStatusBar" ) { showStatusBar = safari.extension.settings.enableStatusBar } }
}
var currentToolbarIconTarget = null;
var currentIconStatus = "normal";
function updateToolbarIcon( a ) {
    if ( a == undefined ) {
        a = currentToolbarIconTarget
    }
    else { currentToolbarIconTarget = a }
    myextension.getVisibleTab( function ( d ) {
        if ( d ) {
            var b = getURLfromBlockPage( currURL );
            var c = "normal";
            if ( isAllowed( b ) ) { c = "allow" } else { if ( isBlockable( b ) && isOnBlockList( b ) ) { c = "block"; myextension.setToolbarIcon( "block", a ) } } if ( c != currentIconStatus ) { currentIconStatus = c; myextension.setToolbarIcon( c, a ); if ( c != "block" ) { myextension.updateToolbarIconBadge( 0, a ) } }
        }
    } )
}
function updateToolbarIconBadge( a ) {
    myextension.updateToolbarIconBadge( a, currentToolbarIconTarget )
}
var alertedOnValidation = false; function validateItem( a ) {
    if
        ( a.target.identifier.search( "settingsButton" ) >= 0 ) {
        if ( DEBUG ) { window.console.log( "Validate Event for: " + a.target.identifier ) }
        installPopover( a.target );
        if ( a.target.browserWindow == safari.application.activeBrowserWindow ) { updateToolbarIcon( a.target ) } return
    }
    else {
        if ( DEBUG ) {
            window.console.log( "Validate Event for: " + a.target.identifier )
        }
        if ( !showContextMenu ) { a.target.disabled = true }
        validateAddSiteCommand( null, function () { a.target.disabled = true } )
    }
}
function popoverHandler( a ) {
    if ( DEBUG ) { window.console.log( "Popover Event for: " + a.target.contentWindow ) } if ( safariPopover ) { safariPopover.contentWindow.updateStatus( getStatus() ) }
}
function respondToMessage( b, e, c, a ) {
    //alert( "this is c.tab.id" + JSON.stringify( c ) );
    //console.log()

    if ( b === "checkURL" ) {
        var d = e; if ( DEBUG ) {
            window.console.log( "checkURL url:" + d.url + " referrer:" + d.referrer + " idleTime:" + d.idleTime )
        }
        if ( SAFARI ) {
            if ( !d.url.startsWith( c.url ) && d.url != "favorites://" ) {
                if ( DEBUG ) { window.console.log( "Safari Tab url mismatch: " + c.url ) } return
            }
        } d.url = removeUserPasswordFromURL( d.url ); d.referrer = removeUserPasswordFromURL( d.referrer ); if ( CHROME ) {
            //alert( "Add tab id [" + c.tab.id + "] => url:" + d.url + " referrer:" + d.referrer );
            if ( DEBUG ) {
                window.console.log( "Add tab id [" + c.tab.id + "] => url:" + d.url + " referrer:" + d.referrer )
            }
            chrome_referrers[ c.tab.id ] = d.referrer;

            if (
                shouldBlock( d.url, d.referrer, myextension.isTabIncognito( c.tab ),
                    function ( g ) {
                        alert( g );

                        return true
                    }
                )
            ) {
                chrome.tabs.update( c.tab.id, { url: getRedirectURL( d.url ) } )
            }
        }
        else {
            if ( shouldBlock( d.url, d.referrer, myextension.isTabIncognito( c ),

                function ( g ) { a( "Alert", g ); return true } ) ) {
                c.url = getRedirectURL( d.url )
            }
            isIdle = ( d.idleTime >= settings.idleTimeout );
            updateToolbarIcon()
        } updatePopover()
    } else {
        if ( b === "reload" ) {
            if ( e ) {
                settings = e; saveSettings( settings );
                if ( DEBUG ) { window.console.log( "Save new settings" ); window.console.log( settings ) } updateGlobalVars( settings ); quota.reinit( settings )
            }
        } else {
            if ( b === "show-settings" ) {
                showSettings()
            } else {
                if ( b === "getTimeLeft" ) {
                    dispatchTimeRemainingInfo( a )
                }
                else {
                    if ( b === "startLockdown" ) {
                        var f = e; lockdownSettings.startLockdown( f.option, f.seconds );
                        dispatchTimeRemainingInfo( a )
                    }
                    else {
                        if ( b === "getSettings" ) {
                            settings.supportPopover = supportPopover();
                            a( "settings", settings )
                        }
                        else {
                            if ( b === "getTimeTrackingInfo" ) {
                                a( "timeTracking", [ e, tracker.getUsage( e, settings.numSitesInTimeTracker ) ] )
                            } else { if ( b === "resetTimeTracker" ) { tracker.resetData() } }
                        }
                    }
                }
            }
        }
    }
}
function dispatchTimeRemainingInfo( a ) {
    if ( DEBUG ) {
        window.console.log( "Dispatch Time Remaining info" )
    }
    if ( lockdownSettings.inLockdown() ) {
        var e = new Date( lockdownSettings.getTimeUntil() ).toLocaleTimeString(); a( "inLockdown", e )
    }
    else {
        if ( settings.enableTimeRange ) {
            var b = quota.isInWorkHour() ? true : false;
            var d = formatRemainingSeconds( Math.round( quota.getWorkHourSeconds() ) ); var f = formatRemainingSeconds( Math.round( quota.getAfterHourSeconds() ) ); a( "timeRemainingWithRanges", [ b, d, f ] )
        }
        else {
            var c = formatRemainingSeconds( Math.round( quota.getRemainingSeconds() ) );
            a( "timeRemaining", c )
        }
    }
}
function addURLToBlockList( a ) {
    settings.blacklist.push( a );
    settings.blacklist.sort( compareURL );
    saveSettings( settings );
    urlRegexListBlocked[ a ] = getRegexPatt( a )
}
function formatRemainingSeconds( a ) {
    if ( settings.activedays[ new Date().getDay() ] ) {
        return formatSeconds( a )
    } else {
        return myextension.getMessage( "Inactive" )
    }
}
function getRegexList( b ) {
    var d = new Array();
    for ( var c in b ) {
        var a = b[ c ]; d[ a ] = getRegexPatt( a )
    } return d
}
var badPatterns = [ "safari://", "chrome://", "chrome-extension://", "safari-extension://", "favorites://" ];
function isTrackableURL( b ) {
    for ( var c = 0; c < badPatterns.length; c++ ) {
        var a = badPatterns[ c ]; if ( b.slice( 0, a.length ) == a ) { return false }
    }
    if ( testRegexPatt( doNotTrackURLRegex, b ) ) { return false } return true
}
function updateQuotaUsage() {
    newtime = new Date().getTime();
    if ( lastcheckTime && currURL ) {
        if ( isIdle ) {
            if ( DEBUG ) { window.console.log( "The active tab is currently idle. Don't count into quota" ) }
        }
        else {
            if ( currURLTracked ) {
                var a = ( newtime - lastcheckTime ) > ( checkInterval * 1000 + 500 ) ? checkInterval : ( newtime - lastcheckTime ) / 1000; if ( currURLTrackedWithQuota ) {
                    quota.useSeconds( a, getMatchingBlockedSite( currURL ) )
                }
                tracker.useSeconds( a, currURL )
            }
        }
    } lastcheckTime = newtime
}
function updateURLTracking( c, d, a, b ) {
    currURL = c;
    currLinkToUrl = d;
    currURLTracked = false;
    currURLTrackedWithQuota = false;
    currURLIncognito = false;
    if ( !isTrackableURL( currURL ) ) {
        if ( DEBUG ) {
            window.console.log( "The active tab (" + currURL + ") currently has system urls. Don't count into quota" )
        }
    }
    else {
        if ( settings.enabledForPrivateBrowsing == "never" && b ) {
            if ( DEBUG ) {
                window.console.log( "The active tab currently is incognito and setting is never track. Don't count into quota" )
            } currURLIncognito = true
        } else {
            if ( settings.enabledForPrivateBrowsing == "blockOnly" && b && !a ) {
                if ( DEBUG ) { window.console.log( "The active tab currently is incognito and setting is track blocked sites only. Don't count into quota" ) }
                currURLIncognito = true
            }
            else { currURLTracked = true; currURLTrackedWithQuota = a }
        }
    }
}
function getTimeString( a ) {
    if ( a < 60 ) {
        return ( "" + Math.round( Math.max( a, 0 ) ) + " second(s)" )
    }
    else {
        return ( "" + Math.floor( a / 60 ) + " minute(s) and " + Math.floor( a % 60 ) + " second(s)" )
    }
}
function shouldBlock( b, l, f, e ) {
    var c = false; var g = b;
    var i = isOnBlockList( b );
    var k = false;
    if ( !i && isBlockable( b ) && l && shouldUseReferrer( l ) ) {
        i = true; g = l
    }
    if ( lockdownSettings.inLockdown() ) {
        inLockdown = true;
        c = isBlockable( b ) && ( ( lockdownSettings.getOption() == "blockAll" ) || ( lockdownSettings.getOption() == "blockAllExceptAllowed" && !isAllowed( b ) ) || ( lockdownSettings.getOption() == "blockBlockedExceptAllowed" && !isAllowed( b ) && i ) )
    }
    else {
        if ( inLockdown ) { inLockdown = false; alert( "Congratulations on making effort to avoid distractions!\nInstant Lockdown period is now over." ) }
        else {
            if ( settings.activedays[ new Date().getDay() ] && isBlockable( b ) && !isAllowed( b ) && i ) {
                var a = getMatchingBlockedSite( g );
                c = ( quota.exceeded( a ) || shouldAlwaysBlock( settings, a ) );
                if ( c ) { updateToolbarIconBadge( 0 ) } else { k = true }
            }
        }
    }
    if ( k && e ) {
        var h = quota.getTimeLeftUntilBlock( a );
        var j = h[ 0 ];
        var d = h[ 1 ];
        var m = quota.getHasWarned( a );
        var n = null; if ( j >= 0 ) {
            var o = false;
            if ( j <= settings.warnAtMinutes * 60 && !m ) {
                n = "WasteNoTime Warning: This site will be blocked within " + getTimeString( j ) + "."; if ( e( n ) ) { quota.warn( a ) }
            }
            else {
                if ( j > settings.warnAtMinutes * 60 ) { quota.unwarn( a ) }
            }
        }
        else {
            if ( d <= settings.warnAtMinutes * 60 && !m ) {
                n = "WasteNoTime Warning: Sites on Block List will be blocked within " + getTimeString( d ) + ".";
                if ( e( n ) ) { quota.warn() }
            }
            else {
                if ( d > settings.warnAtMinutes * 60 ) { quota.unwarn() }
            }
        }
        if ( n ) { window.console.log( "Generated Warning Message: " + n ) }
        var h = ( j >= 0 ) ? j : d; if ( h >= 0 && h <= settings.warnAtMinutes * 60 ) { updateToolbarIconBadge( h ) }
    }
    updateURLTracking( g, b, k, f ); return c
}
function getURLfromBlockPage( a ) {
    if ( a.indexOf( defaultBlockPage ) === 0 ) {
        return a.substr( defaultBlockPage.length )
    } else { return a }
}
function getStatus() {
    var g = new Object();
    var b = getURLfromBlockPage( currURL );
    g.currentURL = standarizeURL( b );
    if ( currLinkToUrl && currLinkToUrl != currURL ) { g.currentURL += "<br/>Linked to: " + standarizeURL( currLinkToUrl, 40 ) }
    if ( lockdownSettings.inLockdown() ) {
        g.inLockdown = true; g.inLockdownUntil = new Date( lockdownSettings.getTimeUntil() ).toLocaleTimeString()
    }
    else { g.inLockdown = false }
    if ( settings.enableTimeRange ) {
        g.enableTimeRange = true;
        g.workhourSeconds = formatRemainingSeconds( Math.round( quota.getWorkHourSeconds() ) );
        g.afterhourSeconds = formatRemainingSeconds( Math.round( quota.getAfterHourSeconds() ) );
        var j = quota.getTimeRange();
        var f = j[ 0 ];
        var k = j[ 1 ];
        if ( f ) { g.inWorkhour = true; g.remainingSeconds = g.workhourSeconds }
        else { g.inWorkhour = false; g.remainingSeconds = g.afterhourSeconds }
        var i = new Date(); i.setTime( Math.floor( new Date().getTime() / 60000 ) * 60000 + k * 60000 ); g.nextTimeSegment = i
    }
    else {
        g.enableTimeRange = false;
        g.remainingSeconds = formatRemainingSeconds( Math.round( quota.getRemainingSeconds() ) )
    }
    g.resetTime = quota.resetTime.toLocaleTimeString();
    if ( isBlockable( b ) ) {
        if ( isAllowed( b ) ) { g.onBlockList = "[" + myextension.getMessage( "On Allow List" ) + "]"; g.matchedSite = standarizeURL( getMatchingAllowedSite( b ) ) }
        else {
            if ( isOnBlockList( b ) ) {
                g.onBlockList = "[" + myextension.getMessage( "On Block List" ) + "]"; if ( isIdle ) { g.isIdle = true; g.remainingSeconds += " [" + myextension.getMessage( "Idle" ) + "]" } else { g.isIdle = false }
                var c = getMatchingBlockedSite( b ); g.matchedSite = standarizeURL( c ); if ( shouldAlwaysBlock( settings, c ) ) { g.perSiteStatus = "[" + myextension.getMessage( "Always Block" ) + "]" } else {
                    if ( settings.enableTimeRange ) {
                        var h = quota.getWorkHourSeconds( c ); if ( h != -1 ) {
                            var e = formatRemainingSeconds( Math.round( h ) );
                            var a = formatRemainingSeconds( Math.round( quota.getAfterHourSeconds( c ) ) );
                            if ( f ) { a = "<span class='ineffective'>" + a + "</span>" }
                            else { e = "<span class='ineffective'>" + e + "</span>" } g.perSiteStatus = "[" + e + "; " + a + "]"
                        }
                    }
                    else {
                        var h = quota.getRemainingSeconds( c ); if ( h != -1 ) { g.perSiteStatus = "[" + formatRemainingSeconds( Math.round( h ) ) + "]" }
                    }
                }
            } else { g.onBlockList = "[" + myextension.getMessage( "Not Blocked" ) + "]" }
        }
    } else { g.onBlockList = "[" + myextension.getMessage( "Reserved" ) + "]" } if ( currURLIncognito ) { g.onBlockList += " [" + myextension.getMessage( "Incognito" ) + "]" } return g
}
function updatePopover() {
    var a = getVisiblePopoverWindow();
    if ( a ) {
        a.updateStatus( getStatus() )
    }
}
function sendWarningMessageToTab( a, b ) {
    if ( CHROME && a.status != "complete" ) { return false }
    myextension.sendMessage( a, "Alert", b ); return true
}
var previousActiveTab = null;
function checkActiveTab() {
    myextension.getVisibleTab(
        function ( a ) {


            if ( a ) {
                var b = removeUserPasswordFromURL( a.url );


                if ( b ) {
                    updateQuotaUsage();
                    if ( CHROME ) {
                        if ( shouldBlock( b, chrome_referrers[ a.id ],
                            myextension.isTabIncognito( a ),
                            function ( e ) { return sendWarningMessageToTab( a, e ) } ) ) {
                            chrome.tabs.update( a.id, { url: getRedirectURL( b ) } )
                        }
                        else {
                            chrome.idle.queryState( settings.idleTimeout, function ( e ) {
                                if ( DEBUG ) { window.console.log( "Chrome browser idle state: " + e ) }
                                isIdle = ( e == "idle" || ( chromeLostFocusStart && ( new Date().getTime() - chromeLostFocusStart ) >= ( settings.idleTimeout * 1000 ) ) ); if ( isIdle && DEBUG ) { window.console.log( "Chrome is idle" ) }
                            } )
                        } updateToolbarIcon()
                    } else {
                        var c = parseURL( b );
                        var d = c[ 0 ].toLowerCase(); if ( d != "http" && d != "https" ) {
                            if ( DEBUG ) { window.console.log( "Can not inject script to " + b ) }
                            updateURLTracking( b, null, false, myextension.isTabIncognito( a ) );
                            updateToolbarIcon()
                        }
                        else {
                            myextension.sendMessage( a, "Track", "" )
                        }
                        if ( previousActiveTab == null || !myextension.isTabSame( a, previousActiveTab ) ) {
                            if ( previousActiveTab && previousActiveTab.url ) { var c = parseURL( previousActiveTab.url ); var d = c[ 0 ].toLowerCase(); if ( d === "http" || d === "https" ) { myextension.sendMessage( previousActiveTab, "Allow", "" ) } } previousActiveTab = a
                        }
                    }
                } updatePopover()
            }
            else {
                if ( SAFARI ) { if ( previousActiveTab ) { myextension.sendMessage( previousActiveTab, "Allow", "" ) } previousActiveTab = null }
            }
        } );
    timer = setTimeout( checkActiveTab, checkInterval * 1000 )
};