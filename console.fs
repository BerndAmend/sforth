: printdirect { x -- }
	x x " " === or x 0= or if
		:[ process.stdout.write(x.toString()) ]:d
	else
		:[ console.log(x); ]:d
	endif
;

: print { x -- }
	x printdirect
	typeof x "number" = if space endif
;

: printnumberwithcomma { x -- }
	typeof x "number" = if
		:[ x.toString() ]: { y } " . " " , " y.replaceAll printdirect space
	endif
;

: hex2str { x1 -- x2 } 16 x1.toString ;
: hexPrint hex2str . ;

: printstack
	" < " depth 1- " >  " + + . depth dup 0
	?DO i
		dup i - pick .
	LOOP
	drop ;

: type ( str -- ) . ;
: emit ( x -- ) String.fromCharCode . ;

: space ( -- ) ."   " ;
: cr ( -- ) ." \n " ;

: clearcurrentline ." \r\033[K " ;