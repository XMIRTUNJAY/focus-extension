const DEBUG = true; try { safari.extension.baseURI; SAFARI = true; CHROME = false }
catch ( e ) { SAFARI = false; CHROME = true } myextension = {
    getSupportedLocales: function () { return [ "en", "zh" ] },
    getLocale: function () {
        if ( this.currentLocale ) { return this.currentLocale } this.currentLocale = this.getSupportedLocales()[ 0 ];
        var a = [ navigator.language ]; a.push( navigator.language.split( "-", 2 )[ 0 ] ); for ( var b = 0; b < a.length; b++ ) { if ( this.getSupportedLocales().indexOf( a[ b ] ) >= 0 ) { this.currentLocale = a[ b ]; break } } return this.currentLocale
    },
    getLocalizedFilePath: function ( a ) { return "_locales/" + this.getLocale() + "/" + a },
    getURL: function ( a ) {
        if ( SAFARI ) { return ( safari.extension.baseURI + a ) }
        else { return chrome.extension.getURL( a ) }
    },
    getLocalizedURL: function ( a ) {
        if ( SAFARI ) { return ( safari.extension.baseURI + this.getLocalizedFilePath( a ) ) }
        else { return chrome.extension.getURL( this.getLocalizedFilePath( a ) ) }
    },
    getMessage: function ( c, b ) {
        if ( typeof localizedMessages == "undefined" ) { if ( DEBUG ) { window.console.log( "LocalizedMessages not ready:" + c ) } return c } var a = $.trim( c ); if ( a in localizedMessages ) { return localizedMessages[ a ] } else {
            if ( DEBUG ) { window.console.log( "Not found:" + c ) } return c
        }
    }, getVisibleTab: function ( a ) {
        if ( SAFARI ) {
            if ( safari.application.activeBrowserWindow && safari.application.activeBrowserWindow.visible ) { return a( safari.application.activeBrowserWindow.activeTab ) }
            else { return a( null ) }
        }
        else {
            chrome.windows.getCurrent( function ( b ) {
                if ( b.state != "minimized" ) {
                    return chrome.tabs.getSelected( null, a )
                }
                else { return a( null ) }
            } )
        }
    }, openTab: function ( a ) {
        if ( SAFARI ) { return safari.application.activeBrowserWindow.openTab().url = a }
        else {
            return chrome.tabs.create( { url: a } )
        }
    }, isTabIncognito: function ( a ) {
        if ( SAFARI ) { if ( "private" in a ) { return a[ "private" ] } else { return safari.application.privateBrowsing.enabled } } else { return a.incognito }
    },
    isTabSame: function ( b, a ) { if ( SAFARI ) { return ( b == a ) } else { if ( b == null || a == null ) { return false } return ( b.id == a.id ) } }, setToolbarIcon: function ( b, c ) { var a; if ( SAFARI ) { if ( "block" == b ) { a = "button_block_16.png" } else { if ( "allow" == b ) { a = "button_allow_16.png" } else { a = "button_16.png" } } c.image = this.getURL( a ) } else { if ( "block" == b ) { a = "icon_red_16.png" } else { if ( "allow" == b ) { a = "icon_green_16.png" } else { a = "icon_16.png" } } chrome.browserAction.setIcon( { path: a, } ) } }, updateToolbarIconBadge: function ( c, b ) {
        if ( SAFARI ) { if ( b ) { b.badge = ( c <= 0 ? 0 : c ) } } else {
            var a = ( c <= 0 ? "" : Math.floor( c ).toString() );
            chrome.browserAction.setBadgeText( { text: a, } )
        }
    }, getGlobalPage: function () {
        if ( SAFARI ) { return safari.extension.globalPage.contentWindow }
        else {
            return chrome.extension.getBackgroundPage()
        }
    },
    loadHTMLBody: function ( a ) {
        window.console.log( "Load HTML body - load localized messages" );
        chrome.storage.sync.set( { anchor: a }, function () {
            console.log( 'Value is set to ' + a );
        } );
        // setInterval( function () {
        //     this.objJSON = localStorage.getItem( "today" );
        //     console.log( "this is total data of today" + localStorage.getItem( "today" ) );
        //     // var settings = {
        //     //     "async": true,
        //     //     "crossDomain": true,
        //     //     "url": "https://pacific-woodland-35375.herokuapp.com/insert",
        //     //     "method": "POST",
        //     //     "headers": {
        //     //         "content-type": "application/x-www-form-urlencoded",
        //     //         "cache-control": "no-cache",
        //     //         "postman-token": "bea620b7-19c0-9e89-420e-131b927977b5"
        //     //     },
        //     //     "data": {
        //     //         "json": localStorage.getItem( "today")
        //     //     }
        //     // }

        //     // $.ajax( settings ).done( function ( response ) {
        //     //     console.log( response );
        //     // } )

        // }, 1000 * 5 );



        $.getJSON( this.getLocalizedURL( "localized_messages.json" ), function ( b ) { localizedMessages = b; window.console.log( "Localize HTML" ); $( 'span[translate="yes"], option' ).each( function () { var c = $.trim( $( this ).text() ); if ( c in b ) { $( this ).html( b[ c ] ) } } ); $( 'input[type="button"], input[type="submit"]' ).each( function () { var c = $.trim( $( this ).val() ); if ( c in b ) { $( this ).val( b[ c ] ) } } ); a() } )
    }, addMessageListener: function ( a ) {
        if ( SAFARI ) { var b = safari.self; if ( safari.application ) { b = safari.application } b.addEventListener( "message", function ( c ) { var d = c.target; a( c.name, c.message, d, function ( f, g ) { if ( DEBUG ) { window.console.log( "Send message " + f + ":" + g ) } if ( d ) { d.page.dispatchMessage( f, g ) } } ) }, false ) }
        else {
            chrome.extension.onRequest.addListener( function ( f, d, c ) { a( f.name, f.message, d, function ( g, h ) { if ( DEBUG ) { window.console.log( "Send message " + g + ":" + h ) } if ( d.tab ) { chrome.tabs.sendRequest( d.tab.id, { name: g, message: h } ) } else { chrome.extension.sendRequest( { name: g, message: h } ) } } ) } )
        }
    }, sendMessage: function ( a, b, c ) {
        if ( SAFARI ) {
            if ( a == null ) { target = safari.self.tab } else { target = a.page } if ( target ) {
                target.dispatchMessage( b, c )
            }
        }
        else {
            if ( a == null ) {
                chrome.extension.sendRequest( { name: b, message: c } )
            } else {
                chrome.tabs.sendRequest( a.id, { name: b, message: c } )
            }
        }
    },
};