
: try-catch-test ( -- n )
  try
    10
    throw
  catch e
    20
  endtry
;

try-catch-test 20 = »try-catch failed« assert

: try-finally-test ( -- n )
  try
    30
  finally
    1 +
  endtry
;

30 try-finally-test 31 = »try-finally failed« assert

: try-catch-finally-test ( -- n )
  try
    40
    throw
  catch e
    e 1 +
  finally
    2 +
  endtry
;

try-catch-finally-test 43 = »try-catch-finally failed« assert
