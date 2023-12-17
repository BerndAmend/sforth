:macro m1 { t } t ;
:macro m2 { t } #t ;

m1 10 10 === »the result of m1 10 should be 10 :)« assert
m1 "other" "other" === »the result of m1 "other" should be "other" :)« assert
1 m1 drop

m2 10 10 === »the result of m2 10 should be 10 :)« assert
m2 "other" "other" === »the result of m2 "other" should be "other" :)« assert
m2 bla "bla" === »the result of m2 bla should be "bla" :)« assert