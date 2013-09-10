
: test  ( n -- )
 CASE
   14 OF cr ." vierzehn" ENDOF
   17 OF cr ." siebzehn" ENDOF
   ." kein Treffer"           \ n kann mit dup hinter ENDCASE gebracht werden
 ENDCASE ;

