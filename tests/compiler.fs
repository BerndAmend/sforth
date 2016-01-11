
\ create javascript code from a forth string
»: testfunc1 ( -- ) "Func1" ; : testfunc2 ( -- ) "Func2" ;« forth.compile vm.runInThisContext(1);

testfunc1 "Func1" = »The dynamically created function testfunc1 didn't behave as expected« assert
testfunc2 "Func2" = »The dynamically created function testfunc1 didn't behave as expected« assert