 : fac-rec ( acc n -- n! )
	 dup dup 1 = swap 0 = or
	 if
		 drop ( drop 1 or 0, leaving the accumulator )
	 else
		 dup 1 - rot rot * swap fac-rec ( recurse )
	 endif
 ;


 : fac ( n -- n! )
	 1 swap fac-rec ;
	 
4 fac 24 = " fac didn't return the correct result " assert

