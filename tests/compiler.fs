
\ create javascript code from a forth string
"
: testfunc1 ( -- ) \" Func 1 \" ;
: testfunc2 ( -- ) \" Func 2 \" ;

undefined value testvar
true if
    ' testfunc1 to testvar
else

    ' testfunc2 to testvar
endif

testvar ' testvar execute \" Func 1 \" = \" testvar didn't return the correct result \" assert

" compile jseval

testfunc1 " Func 1 " = " check if the dynamically created function testfunc1 behave as expected " assert
testfunc2 " Func 2 " = " check if the dynamically created function testfunc2 behave as expected " assert