
\ : print { x -- }  :[ process.stdout.write(x.toString()); ]:d ;
: print { x -- }  :[ if(x || x === "" || x == 0 ) process.stdout.write(x.toString()); else console.log(x); ]:d ;
\ : print { x -- }  :[ if(x) console.log(x.toString()); else console.log(x); ]:d ;
: hex2str { x1 -- x2 } 16 x1.toString ;
: hexPrint hex2str . ;

: printstack
	" < " depth " >  " + + . depth dup 0
	?DO i
		dup i - pick .
	LOOP
	drop ;

: type ( str -- ) . ;
: emit ( x -- ) String.fromCharCode . ;

: space ( -- ) ."   " ;
: cr ( -- ) ." \n " ;

: clearcurrentline ." \r\033[K " ;