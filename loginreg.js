function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace( /[?&]+([^=&]+)=([^&]*)/gi, function ( m, key, value ) {
        vars[ key ] = value;
    } );
    return vars;
}




// Function to get input value.
$( document ).ready( function () {
    var mail = getUrlVars()[ "email" ];
    var pwd = getUrlVars()[ "password" ];
    try {
        var pwd1 = pwd.substring( 0, pwd.indexOf( '#' ) );
        alert( "user logged in succesfully" + mail );
        console.log( "the email is :" + mail + "the password is :" + pwd1 );


        // $( '#Submit' ).click( function () {
        //     mail = $( "#email" ).val();
        //     pwd = $( "#password" ).val();
        //     console.log( "email is" + mail + "the password is" + pwd );

        // } );


        var data = JSON.stringify( {
            "username": mail,
            "password": pwd1
        } );
        console.log( "the json data to be sent is" + data );
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener( "readystatechange", function () {
            if ( this.readyState === 4 ) {
                var response1 = JSON.parse( this.responseText );

                response1.forEach( function ( obj ) {
                    console.log( obj._profile__uid );
                    localStorage.setItem( "user_id", obj._profile__uid );
                } );
                //const { username, email, _profile__location, _profile__bio, _profile__uid } = JSON.parse( this.responseText );
                //console.log( "the user id is :" + username );
                //localStorage.setItem( "user_id", response1._profile__uid );
                console.log( this.responseText );
            }
        } );

        xhr.open( "POST", "https://focususermanagement.herokuapp.com/somethingLogin/" );
        xhr.setRequestHeader( "content-type", "application/json" );
        xhr.setRequestHeader( "cache-control", "no-cache" );
        xhr.setRequestHeader( "postman-token", "c90e4029-9a6a-49ce-2dfa-a4a42f771a37" );

        xhr.send( data );
    }
    catch ( err ) {
        console.log( err, "Password Error" );
    }
} );