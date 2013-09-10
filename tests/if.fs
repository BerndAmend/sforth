
: if-test-1 ( f f f -- n )
	if
		if
			if
				1
			else
				2
			endif
		else
			if
				3
			else
				4
			endif
		endif
	else
		if
			if
				5
			else
				6
			endif
		else
			if
				7
			else
				8
			endif
		endif
	then
;

false true false if-test-1 4 = " if didn't behave as expected 1 " assert
false false false if-test-1 8 = " if didn't behave as expected 2 " assert
true true true if-test-1 1 = " if didn't behave as expected 3 " assert
