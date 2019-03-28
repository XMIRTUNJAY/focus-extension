
var jsonobj = {};
sendRequest = ( id, cat, timeSpent ) => {
    var data = `id=${ id }&category=${ cat }&timeSpent=${ timeSpent }`;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener( "readystatechange", function () {
        if ( this.readyState === 4 ) {

            alert( this.responseText );
            // var url;

            // var i = 0;
            // chrome.tabs.query( {}, function ( tabs ) {
            //     tabs.forEach( function ( tab ) {
            //         //alert( JSON.stringify( tab.id + getDomainNew( tab.url ) ) );
            //         jsonobj[ tab.id ] = getDomainNew( tab.url );
            //         //jsonobj[ "url" ] = getDomainNew( tab.url );

            //     } );
            //     // url = tabs[ 0 ].url;
            // } );

            var obj = JSON.parse( this.responseText );
            // if ( obj[ Object.keys( obj )[ 0 ] ] <= 1 ) {

            //     alert( "time remaining is is less than equal to 1 second" );

            //     var visit = JSON.parse( localStorage.getItem( "visited" ) )
            //     var url;

            //     var i = 0;
            //     let pp = new Promise( resolve => {
            //         chrome.tabs.query( {}, function ( tabs ) {
            //             tabs.forEach( function ( tab ) {
            //                 //alert( JSON.stringify( tab.id + getDomainNew( tab.url ) ) );
            //                 jsonobj[ tab.id ] = getDomainNew( tab.url );
            //                 //jsonobj[ "url" ] = getDomainNew( tab.url );

            //             } );
            //             resolve( jsonobj );
            //             // url = tabs[ 0 ].url;
            //         } );
            //     }


            // }
            if ( obj[ Object.keys( obj )[ 0 ] ] === 2 ) {
                // alert( "time remainig is only 2 min pls hurry up!" );
                var notifOptions = {
                    type: "basic",
                    priority: 1,
                    iconUrl: "icon_48.png",
                    title: "LIMIT REACHED!",
                    message: "Uh oh, look's like you've reached your alloted limit. tab will claose after few minutes."
                };

                chrome.notifications.create( 'limitNotif', notifOptions );
            }

            else if ( obj[ Object.keys( obj )[ 0 ] ] === 0 ) {

                var x;
                var visit = JSON.parse( localStorage.getItem( "visited" ) )
                var url;
                alert( "Time remaining 0" );
                var i = 0;
                let pp = new Promise( resolve => {
                    chrome.tabs.query( {}, function ( tabs ) {
                        tabs.forEach( function ( tab ) {
                            //alert( JSON.stringify( tab.id + getDomainNew( tab.url ) ) );
                            jsonobj[ tab.id ] = getDomainNew( tab.url );
                            //jsonobj[ "url" ] = getDomainNew( tab.url );

                        } );
                        alert( 'Promise Resolved' )
                        resolve( jsonobj );
                        // url = tabs[ 0 ].url;
                    } );
                } )
                pp.then( result => {
                    alert( 'After Promise Resolved' )
                    alert( result );
                    for ( x in visit ) {
                        if ( visit[ x ] === Object.keys( obj )[ 0 ] ) {
                            //alert( JSON.stringify( jsonobj ) );

                            for ( y in result ) {
                                if ( result[ y ] === x ) {
                                    alert( "the tab id is matched " + y + "the tab url is" + x );

                                    chrome.tabs.remove( parseInt( y ) );
                                }
                                // alert( "the tab id is not matched " + y + "the tab url is" + jsonobj[ x ] );
                            }
                            //alert( "time remaining is 0" );

                        }
                    }
                } )
            }

            //category:0 then block that category
            //visited site block {website:name}
        }
    } );

    xhr.open( "POST", "https://pacific-woodland-35375.herokuapp.com/api/insert2" );
    xhr.setRequestHeader( "content-type", "application/x-www-form-urlencoded" );
    xhr.setRequestHeader( "cache-control", "no-cache" );

    xhr.send( data );
}

lala = () => {
    let prev = JSON.parse( localStorage.getItem( "prevState" ) );
    let curr = JSON.parse( localStorage.getItem( "curr" ) );
    if ( prev === null ) {
        localStorage.setItem( "prevState", JSON.stringify( curr ) );
    }
    else {
        let keys = Object.keys( curr );
        let y = 0;
        for ( i in keys ) {
            let x = keys[ i ];
            if ( curr[ x ] != prev[ x ] ) {
                sendRequest( localStorage.getItem( 'user_id' ), x, ( curr[ x ] - prev[ x ] ) / 50 );
                if ( ( curr[ x ] - prev[ x ] ) >= 50 )
                    y = 1;
            }
        }
        if ( y )
            localStorage.setItem( "prevState", JSON.stringify( curr ) );
    }
}

//Trying to replace lala(). Added on 25/3/19
lalala = () => {
    if ( localStorage.getItem( 'user_id' ) !== null ) {
        let prev = JSON.parse( localStorage.getItem( "prevState" ) );
        let curr = JSON.parse( localStorage.getItem( "today" ) );
        let cats = JSON.parse( localStorage.getItem( "visited" ) );
        if ( prev === null ) {
            // alert('Here once');
            localStorage.setItem( "prevState", JSON.stringify( curr ) );
        }
        else {
            let keys = Object.keys( curr );
            for ( let i = 0; i < keys.length; i++ ) {
                let x = keys[ i ];
                if ( x in prev ) {
                    if ( curr[ x ] - prev[ x ] >= 50 && ( x in cats ) ) {
                        sendRequest( localStorage.getItem( 'user_id' ), cats[ x ], ( curr[ x ] - prev[ x ] ) / 50 );
                        prev[ x ] = curr[ x ];
                        localStorage.setItem( "prevState", JSON.stringify( prev ) );
                    }
                }
                else {
                    prev[ x ] = 0;
                    localStorage.setItem( "prevState", JSON.stringify( prev ) );
                }
            }

        }
    }
    clearInterval( myInterval );
    var myInterval = setInterval( lalala, 60000 );
    myInterval;
}

var myInterval = setInterval( lalala, 60000 );

myInterval;