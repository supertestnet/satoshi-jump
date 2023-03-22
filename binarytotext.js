function bytesToHex( bytes ) {
    return bytes.reduce( ( str, byte ) => str + byte.toString( 16 ).padStart( 2, "0" ), "" );
}

function hexToText( hex ) {
    var bytes = new Uint8Array(Math.ceil(hex.length / 2));
    for (var i = 0; i < hex.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    var text = new TextDecoder().decode( bytes );
    return text;

}

function binaryToText(binary) {
    binary = binary.match(/.{1,8}/g);
    var arr = [];
    binary.forEach( function( digit ) {
        arr.push( parseInt( digit.split('').join(''), 2 ) );
    });
    var uint8 = new Uint8Array( arr );
    return hexToText( bytesToHex( uint8 ) );
}
