$( document ).ready( function () {
    $( "#quote" ).html( pickAQuote() );
    $( "#blockedURL" ).html( document.location.search.substr( 1 ) )
} );
var _gaq = _gaq || [];
_gaq.push( [ "_setAccount", "UA-23593853-1" ] );
_gaq.push( [ "_trackPageview" ] );
(
    function () {
        var b = document.createElement( "script" );
        b.type = "text/javascript";
        b.async = true;
        b.src = "https://ssl.google-analytics.com/ga.js";
        var a = document.getElementsByTagName( "script" )[ 0 ];
        a.parentNode.insertBefore( b, a )
    } )();
(
    function ( e, a, f ) {
        var c, b = e.getElementsByTagName( a )[ 0 ];
        if ( e.getElementById( f ) ) { return }
        c = e.createElement( a );
        c.id = f;
        c.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&appId=389372931225032&version=v2.0";
        b.parentNode.insertBefore( c, b )
    }( document, "script", "facebook-jssdk" ) );