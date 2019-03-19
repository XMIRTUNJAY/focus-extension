function printPerSiteOption( c, b )
{
    var d = c.perSiteOptions[ trim( b ) ];
    var a = ""; if ( !d ) { return a }
    if ( d.includeChildren )
    { a += "+" + myextension.getMessage( "links" ) }
    if ( d.option == "alwaysBlock" )
    {
        a += " [" + myextension.getMessage( "Always_Block" ) + "]"
    }
    else
    {
        if ( d.option == "useCustom" ) { if ( c.enableTimeRange ) { a += " [" + d.quota[ 0 ] + " " + myextension.getMessage( "Min" ) + ";" + d.quota[ 1 ] + " " + myextension.getMessage( "Min" ) + "]" } else { a += " [" + d.quota[ 0 ] + " " + myextension.getMessage( "Min" ) + "]" } }
    } return a
};