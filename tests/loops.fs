: begin-until-test   ( -- )  7 BEGIN  1+ dup 12 = UNTIL ;
begin-until-test 12 = »begin-until-test result should be 12« assert


: begin-again-test   ( -- 12 )  7 BEGIN 1+ dup 12 = IF ":)" exit THEN AGAIN ":(" ;
begin-again-test ":)" = »begin-again-test should return :)« assert

(
: begin-while-repeat-test  ( -- )  7 BEGIN 1+ dup 12 < WHILE dup "\n" + . REPEAT :[ " ".repeat(5) ]: type ;
begin-while-repeat-test
)