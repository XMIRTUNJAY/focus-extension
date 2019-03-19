var settings = null;
var defaultTab = "timeRemaining";
var chart = null;
const MAX_DOMAIN_LENGTH = 24;
function updateTopSitesChart( c, e ) {
    var d = settings.numSitesInTimeTracker;
    var b = $.map( e, function ( h, g ) {
        if ( g < d ) {
            if ( h[ 0 ].length > MAX_DOMAIN_LENGTH ) {
                return "..." + h[ 0 ].slice( h[ 0 ].length - MAX_DOMAIN_LENGTH )
            }
            else {
                return h[ 0 ]
            }
        } else {
            return null
        }
    } );
    var f = $.map( e, function ( h, g ) {
        if ( g < d ) {
            return ( h[ 0 ], Math.round( h[ 1 ] / 60 * 10 ) / 10 )
        }
        else { return null }
    } );
    if ( chart ) { chart.destroy(); $( ".chartButton" ).removeClass( "selected" ) } if ( c == "month" ) { subtitle = myextension.getMessage( "for the past 30 days" ); $( "#chartButtonMonth" ).addClass( "selected" ) } else {
        if ( c == "week" ) { subtitle = myextension.getMessage( "for the past 7 days" ); $( "#chartButtonWeek" ).addClass( "selected" ) } else { subtitle = myextension.getMessage( "for today" ); $( "#chartButtonDay" ).addClass( "selected" ) }
    }
    var a = e.reduce( function ( g, h ) {
        return g + Math.round( h[ 1 ] / 60 * 10 ) / 10
    }, 0 ); $( "#timeFrame" ).html( subtitle ); $( "#hoursInTotal" ).html( Math.floor( a / 60 ) ); $( "#minutesInTotal" ).html( Math.floor( a % 60 ) ); chart = new Highcharts.Chart( { chart: { renderTo: "topSites", defaultSeriesType: "bar" }, title: { text: myextension.getMessage( "Top" ) + " " + d + " " + myextension.getMessage( " Sites You Have Spent Time On" ), }, subtitle: { text: subtitle, }, xAxis: { categories: b, title: { text: null } }, yAxis: { min: 0, title: { text: myextension.getMessage( "Time Spent (minutes)" ), align: "high" } }, tooltip: { formatter: function () { return "" + this.x + ": " + this.y + " minutes" } }, plotOptions: { bar: { dataLabels: { enabled: true } } }, legend: { enabled: false, }, credits: { enabled: false }, series: [ { data: f, } ], } )
}
function getAnswer( g, j, c, a ) {
    if ( DEBUG ) {
        window.console.log( "Got message " + g + ":" + j )
    }
    if ( g == "settings" ) {
        var i = settings; settings = j; if ( null === i && settings ) { initializePage() }
    }
    else {
        if ( g == "inLockdown" ) {
            var h = j;
            $( "#lockdownUntil" ).html( h ); showStatus( ".inLockdown" ); $( "input.lockdown" ).attr( "disabled", true )
        }
        else {
            if ( g == "timeRemainingWithRanges" ) {
                var d = j[ 0 ]; var e = j[ 1 ]; var f = j[ 2 ]; var b = " <img src='arrow.gif' title='Current time'/>"; if ( d ) {
                    $( "#workHourIndicator" ).html( b ); $( "#afterHourIndicator" ).html( "" )
                } else { $( "#workHourIndicator" ).html( "" ); $( "#afterHourIndicator" ).html( b ) }
                $( "#remainingtime1" ).html( e ); $( "#remainingtime2" ).html( f ); $( "#currentTime" ).html( myextension.getMessage( "Current time is" ) + " " + new Date().toLocaleTimeString() ); showStatus( ".timeRanges" ); $( "input.lockdown" ).attr( "disabled", false )
            } else { if ( g == "timeRemaining" ) { $( "#remainingtime0" ).html( j ); showStatus( ".noTimeRanges" ); $( "input.lockdown" ).attr( "disabled", false ) } else { if ( g == "timeTracking" ) { updateTopSitesChart( j[ 0 ], j[ 1 ] ) } } }
        }
    }
}
function showStatus( a ) { $( ".status" ).hide(); $( ".status" + a ).show() }
function initializePage() {
    if ( !settings ) { return } if ( settings.supportPopover && !( DEBUG ) ) { removeTimeRemainingTab() }
    var b = document.location.hash.substr( 1 );
    if ( !b ) { b = defaultTab } $( "#vtab>ul>li." + b ).mousedown();
    $( "#name" ).val( settings.name );
    var f = ""; var e = 0;
    for ( var c = 0; c < 7; c++ ) {
        if ( settings.activedays[ c ] ) { if ( f ) { f += ", " + myextension.getMessage( weekday[ c ] ) } else { f += myextension.getMessage( weekday[ c ] ) } e++ }
    } if ( e == 7 ) {
        f = myextension.getMessage( "Everyday" )
    } $( "#activeDaysValue" ).html( f );
    if ( settings.enabledForPrivateBrowsing == "never" ) {
        $( "#enabledForPrivateBrowsingOption" ).html( myextension.getMessage( "Do not track time used at any web site" ) )
    }
    else {
        if ( settings.enabledForPrivateBrowsing == "always" ) {
            $( "#enabledForPrivateBrowsingOption" ).html( myextension.getMessage( "Track time used at any web site as normal" ) )
        }
        else {
            $( "#enabledForPrivateBrowsingOption" ).html( myextension.getMessage( "Track only time used at web sites on Block List" ) )
        }
    }
    if ( settings.blockurlUseDefault ) {
        $( "#blockurl" ).html( myextension.getMessage( "use default block page" ) )
    }
    else {
        $( "#blockurl" ).html( "redirect to " + settings.blockurl )
    }
    $( "#warnAtMinutes" ).html( settings.warnAtMinutes );
    for ( c in settings.blacklist ) {
        li = document.createElement( "li" );
        var d = printPerSiteOption( settings, settings.blacklist[ c ] );
        if ( d ) { li.innerHTML = "<span>" + settings.blacklist[ c ] + " <span class='blockedSiteOption'>" + d + "</span></span>" } else { li.innerHTML = "<span>" + settings.blacklist[ c ] + "</span>" } $( "#blockedsites" ).append( li )
    }
    $( "#blockedsites>li:odd" ).removeClass( "rowHighlight" ); $( "#blockedsites>li:even" ).addClass( "rowHighlight" );

    for ( c in settings.whitelist ) {
        li = document.createElement( "li" );
        li.innerHTML = settings.whitelist[ c ];
        $( "#allowedsites" ).append( li )
    }
    $( "#allowedsites>li:odd" ).removeClass( "rowHighlight" ); $( "#allowedsites>li:even" ).addClass( "rowHighlight" ); var a = ""; for ( var c in settings.time_ranges ) { a += "<li>" + settings.time_ranges[ c ].start + " to " + settings.time_ranges[ c ].end }
    $( "#rangeDefinitions" ).html( a );
    $( "#allowtime0" ).html( settings.allowed_minutes_wh ); $( "#allowtime1" ).html( settings.allowed_minutes_wh );
    $( "#allowtime2" ).html( settings.allowed_minutes_ah ); $( ".allowtime" ).hide(); if ( settings.enableTimeRange ) {
        $( ".allowtime.timeRanges" ).show()
    }
    else {
        $( ".allowtime.noTimeRanges" ).show()
    }
    $( "#challengeEnabled" ).html( settings.enableChallenge ? "<img src='lock_16.png' /> " + myextension.getMessage( "Challenge Enabled" ) : "<img src='lock_open_16.png' /> <a href='" + myextension.getURL( "edit.html#challenge" ) + "'>" + myextension.getMessage( "Challenge Disabled" ) + "</a>" ); $( "#idleTimeout" ).html( settings.idleTimeout / 60 ); myextension.sendMessage( null, "getTimeLeft", "" ); window.onfocus = function () {
        myextension.sendMessage( null, "getTimeLeft", "" );
        if ( DEBUG ) { window.console.log( "onFocus: getTimeLeft" ) }
    };
    $( ".jqmWindow" ).jqm( { modal: true, overlay: 30 } ); $( "#mydialog" ).keyup( function ( g ) { if ( g.keyCode == 13 ) { $( "#dialogOKButton" ).click() } } )
}
var randomText = ""; function showDialog( c ) { if ( settings.challengeType == "random" ) { randomText = randomString( settings.challengeLength ); var a = "&zwnj;"; var b = scrabbleString( randomText, a ); $( "#scrabbledText" ).html( b ); $( "#passwordChallenge" ).hide(); $( "#randomChallenge" ).show() } else { $( "#randomChallenge" ).hide(); $( "#passwordChallenge" ).show() } $( "#mydialog" ).jqmShow() } function hideDialog() { $( "#mydialog" ).jqmHide() } function checkAnswer() { if ( settings.challengeType == "random" ) { if ( $( "#challengeText" ).val() == randomText ) { $( "#challengeError2" ).html( "" ); $( "#challengeText" ).val( "" ); hideDialog(); openEditSettingsPage() } else { $( "#challengeText" ).val( "" ); $( "#challengeError2" ).html( myextension.getMessage( "Input doesn't match text! Copy & Paste has been disabled and will not work. Try again." ) ) } } else { if ( $( "#password" ).val() == settings.challengePassword ) { $( "#challengeError1" ).html( "" ); $( "#password" ).val( "" ); hideDialog(); openEditSettingsPage() } else { $( "#password" ).val( "" ); $( "#challengeError1" ).html( myextension.getMessage( "Wrong password! Try again." ) ) } } } function removeTimeRemainingTab() { $( "#vtab>ul>li.timeRemaining" ).remove(); $( "#vtab>div.timeRemaining" ).remove(); defaultTab = "blockedSites"; var a = $( "#vtab>ul>li" ); a.mousedown( function () { var b = a.index( $( this ) ); a.removeClass( "selected" ); $( this ).addClass( "selected" ); $( "#vtab>div" ).hide().eq( b ).show() } ) } $( document ).ready( function doc_ready() { window.console.log( "DOM ready" ); if ( typeof myextension == "undefined" ) { window.console.log( "extension.js is not loaded" ); setTimeout( doc_ready, 1 ); return } myextension.loadHTMLBody( function () { window.console.log( "HTML body loaded - adding hooks" ); $( "#dialogCancelButton" ).click( function () { hideDialog() } ); $( "#dialogOKButton" ).click( function () { checkAnswer() } ); $( "#startLockdown" ).click( function () { startLockdown() } ); $( "#editSettings" ).click( function () { editSettings() } ); if ( SAFARI ) { $( "#google_chrome_incognito_notice" ).hide() } if ( CHROME ) { $( "#chrome_extension_link" ).click( function () { chrome.tabs.create( { url: "chrome://extensions" } ) } ) } var a = $( "#vtab>ul>li" ); a.mousedown( function () { var b = a.index( $( this ) ); a.removeClass( "selected" ); $( this ).addClass( "selected" ); $( "#vtab>div" ).hide().eq( b ).show() } ); a.mouseover( function () { $( this ).addClass( "highlight" ) } ); a.mouseout( function () { $( this ).removeClass( "highlight" ) } ); $( "#chartButtonDay" ).click( function () { myextension.sendMessage( null, "getTimeTrackingInfo", "day" ) } ); $( "#chartButtonWeek" ).click( function () { myextension.sendMessage( null, "getTimeTrackingInfo", "week" ) } ); $( "#chartButtonMonth" ).click( function () { myextension.sendMessage( null, "getTimeTrackingInfo", "month" ) } ); $( ".timeSelection" ).timePicker( { show24Hours: false, separator: ":", step: 15 } ).click( function () { $( "#lockdownUseUntil" ).prop( "checked", true ) } ).blur( validateLockdownUntilTime ); myextension.addMessageListener( getAnswer ); myextension.sendMessage( null, "getSettings", "" ); myextension.sendMessage( null, "getTimeTrackingInfo", "day" ) } ) } ); function editSettings() { if ( settings.enableChallenge ) { showDialog() } else { openEditSettingsPage() } } function openEditSettingsPage() {
    var a = $( "#vtab>ul>li.selected" ).attr( "href" );
    var b = myextension.getURL( "edit.html?token=" + getTimeToken() + a ); window.location = b
}
function startLockdown() {
    var a = 0; var b; if ( $( "input[name='lockdownTimeOption']:checked" ).val() == "minutes" ) {
        var a = parseInt( $( "#lockdownHowLong" ).val() ); if ( !( 0 < a && a <= 1440 ) ) { $( "#lockdownMinutesError" ).html( myextension.getMessage( "Invalid input. Must be between 1 to 1440 minutes (24 hours)." ) ); return } $( "#lockdownMinutesError" ).html( "" );
        b = confirm( myextension.getMessage( "Start Lockdown for" ) + " " + a + " " + myextension.getMessage( "minutes\n\nWarning: Once Lockdown is activated, it can't be canceled. Click OK to start Lockdown or Cancel to abort." ) )
    } else { a = validateLockdownUntilTime(); if ( !( 0 < a && a <= 1440 ) ) { return } b = confirm( myextension.getMessage( "Start Lockdown which ends at" ) + " " + $( "#lockdownUntilTime" ).val() + " " + myextension.getMessage( "\n\nWarning: Once Lockdown is activated, it can't be canceled. Click OK to start Lockdown or Cancel to abort." ) ); a = validateLockdownUntilTime(); if ( !( 0 < a && a <= 1440 ) ) { return } } if ( b == false ) { return } var c = { option: $( "input[name='lockdownOption']:checked" ).val(), seconds: a * 60 }; myextension.sendMessage( null, "startLockdown", c ); setTimeout( function () { myextension.sendMessage( null, "getTimeLeft", "" ) }, a * 60 * 1000 + 500 )
} function validateLockdownUntilTime() { var d = $( "#lockdownUntilTime" ).val(); if ( !d ) { $( "#lockdownUntilError" ).html( "" ); return 0 } var c = normalizeTime( d, false ); if ( !c ) { $( "#lockdownUntilError" ).html( myextension.getMessage( "Invalid time input [hh:mm AM|PM]: " ) + d ); return 0 } var b = getMinutesOfDay( c ); var a = getMinutesOfDay( new Date() ); if ( b <= a ) { $( "#lockdownUntilError" ).html( myextension.getMessage( "tomorrow" ) ) } else { $( "#lockdownUntilError" ).html( "" ) } return a < b ? ( b - a ) : ( b + 24 * 60 - a ) } var _gaq = _gaq || []; _gaq.push( [ "_setAccount", "UA-23593853-1" ] ); _gaq.push( [ "_trackPageview" ] ); ( function () { var b = document.createElement( "script" ); b.type = "text/javascript"; b.async = true; b.src = "https://ssl.google-analytics.com/ga.js"; var a = document.getElementsByTagName( "script" )[ 0 ]; a.parentNode.insertBefore( b, a ) } )();