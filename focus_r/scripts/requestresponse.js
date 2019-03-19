
setInterval( function () {
    this.objJSON = localStorage.getItem( "today" );
    console.log( "this is total data of today" + localStorage.getItem( "today" ) );
    // var settings = {
    //     "async": true,
    //     "crossDomain": true,
    //     "url": "https://pacific-woodland-35375.herokuapp.com/insert",
    //     "method": "POST",
    //     "headers": {
    //         "content-type": "application/x-www-form-urlencoded",
    //         "cache-control": "no-cache",
    //         "postman-token": "bea620b7-19c0-9e89-420e-131b927977b5"
    //     },
    //     "data": {
    //         "json": localStorage.getItem( "today")
    //     }
    // }

    // $.ajax( settings ).done( function ( response ) {
    //     console.log( response );
    // } )

}, 1000 * 5 );

