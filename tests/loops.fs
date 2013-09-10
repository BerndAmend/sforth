: begin-until-test   ( -- )  7 BEGIN  1+ dup 12 = UNTIL . ;
begin-until-test

: begin-while-repeat-test  ( -- )  7 BEGIN 1+ dup 12 < WHILE dup cr . REPEAT 5 spaces . ;
begin-while-repeat-test

: begin-again-test   ( -- 12 )  7 BEGIN 1+ dup 12 = IF " erreicht " . EXIT THEN AGAIN " wird nie erreicht " . ;

begin-again-test
