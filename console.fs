
: . { x -- } :[ console.log(x) ]:d ;
: hex2str { x1 -- x2 } :[ x1.toString(16) ]: ;
: hex. hex2str . ;

: .s ( -- ) :[ console.log(stack.toString()) ]:d ;
: type { str -- } :[ console._stdout.write(str) ]:d ;
: emit { x -- } :[ console._stdout.write(String.fromCharCode(x)) ]:d ;

: cr ( -- ) :[ console.log() ]:d ;