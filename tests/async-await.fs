:async fisch { v } v return;
:async testfunc {} 42 fisch await 42 = "fisch returns the correct value" assert ;
:async testfunc2 {} "Hello" . 1000 sleep await; "World" . ;

testfunc(0)
testfunc2(0)
