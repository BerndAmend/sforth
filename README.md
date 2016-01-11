# sforth

sforth is a script language with a forth like syntax that compiles to javascript.
It allows a seemless integration into normal javascript applications and websites.
See http://tptb.github.io/sforth/

## node.js

Get the source code and start the sforth repl

./sforth

or

node nodeForth.js


## Firefox (>=44) / Chromium / Google Chrome

The examples require that they are served using a static webserver.
A test webserver is included that only requires node.js.
Start it and follow the printed instructions

./sforth webserver.fs

To test the raytracer locally go to http://localhost:8080/examples/raytracer/

Checkout the examples at http://tptb.github.io/sforth/ (https://github.com/tptb/sforth/tree/master/examples)

## Examples
- [Hello World](http://tptb.github.io/sforth/examples/Hello-World.html)
- [Web worker](http://tptb.github.io/sforth/examples/web-worker.html)
- [Playground](http://tptb.github.io/sforth/examples/playground/)
- [Raytracer](http://tptb.github.io/sforth/examples/raytracer/)
- [Image processing](http://tptb.github.io/sforth/examples/image_processing/)
- [Function plot](http://tptb.github.io/sforth/examples/function-plot.html)

## Syntax

### functions

```forth
\ normal function
: <name> ( <stack-comment> ) <body> ;
\ e.g.
: mul ( x1 x2 -- x ) * ;
\ using an argument list
: mul { x1 x2 -- x } x1 x2 * ;

\ anonymous function - the function is pushed to the stack
:noname ( <stack-comment> ) <body> ;
\ e.g.
:noname ( x1 x2 -- x ) * ;
\ using an argument list
:noname { x1 x2 -- x ) x1 x2 * ;

\ to simplify the integration into normal javascript applications
\ normal javascript functions can be defined.
\ They behave like every javascript function.

\ without a return value
:js <name> { <parameters> } <body> ;

\ with a return value
:js <name> { <parameters> } <body> return;

\ anonymous javascript functions
:jsnoname { <parameters> } <body> ;
:jsnoname { <parameters> } <body> return;

\ push a function reference to the stack
' <function-name>
\ e.g.
' mul

\ Calling javascript functions from sforth
\ If you call javascript functions from forth they will take required number of
\ parameters from the data stack
\ and place the result on the stack
\ If you explicitly want or have to specify the number of arguments that should be passed to a js function
\ you have to use parentheses e.g.
"Test" console.log(1) \ will pass one stack element to the function
\ This is necessary since different browsers report for some functions different argument count values.
```

### macros
Macros are used to rewrite sourcecode before the code gets compiled. value and to are implemented as macros.
```forth
:macro <name> { <arguments> } <body> ;

\ e.g. the value implemention
:macro value { name } :[ var name = stack.pop() ]; ;
\ usage example
30 value test-name

\ e.g. the && implementation
:macro && {} ( x1 x2 -- x3 ) :[ stack.pop() && stack.pop() ]: ;
```

### variables

```forth
\ Defining a value
{ <var1> <var2> <var3> ... -- <comment> }
<initial-value> value <name>
\ e.g.
90 value blobvar
10 20 30 { var1 var2 var3 }

\ assign something to a value
<new-value> to <name>
\ e.g.
42 to blobvar
```

### strings
```forth
\ normal strings
"text"

\ or
»text«
```

### objects
```forth
\ allocating an object
new <classname>
```

### arrays
```forth
<size> new Array

\ Allocate an Array with 42 elements and store it in the variable arr
42 new Array { arr }

\ store a value
<value> <position> <array> !

\ store the value 63 at the 10 position in the array arr
63 10 arr !
\ store the string foo at the 31 position in the array arr
"foo" 31 arr !

\ get a value
<position> <array> @

\ read the value from position 10 and print it
10 arr @ .
```

### if
```forth
<condition> if
	<code>
elseif <next-condition> if \ optional
	<code>
else \ optional
	<code>
endif

\ example
0 0 = if
	":)" .
else
	":(" .
endif
```

### case ... endcase
```forth
<value> case
	of <value>
		<code>
	endof

	of <value>
		<code>
	endof

	default
		<code>
endcase

\ e.g.
"20" case
	of "20"
		":)" .
	endof
	
	default
		
endcase
```

### do ... loop
```forth
<start> <end> <increment> do <variable>
	<code>
loop

\ example - prints the numbers from 0 to 9
0 10 1 do i
	i .
loop

\ example - prints the numbers from 10 to 1
10 0 -1 do counter
	counter .
loop
```

### try ... catch ... finally
```forth
try
	<code>
catch err
	<code>
finally \ optional
	<code>
endtry

\ e.g.
try
	":(" new Error throw
catch err
	err .
endtry
```


### embed javascript code
```forth
\ push the result on the stack
:[ <javascript code> ]:

\ directly insert the code
:[ <javascript code> ]:d

\ insert the code and append a ;
:[ <javascript code> ];
```

### embed into html

#### with jquery (recommended)
```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<!-- throw an exception if a stack underflow occurs -->
	<script>sforthThrowOnUnderflow=true</script>
	<script src="../ext/jquery-2.1.0.min.js"></script>
	<script src="../sforth-runtime.js"></script>
	<script src="../sforth-compiler.js"></script>
</head>
<body>
	<!-- include the base system -->
	<script data-src="../forth.fs;../browser.fs" type="application/sforth"></script>

	<script type="application/sforth">
		:js sayHello { } "Hello World!" show-alert ;
	</script>
	
	<input type="button" value="Say hello!" onclick="sayHello();">
</body>
</html>
```

#### without jquery
```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<!-- throw an exception if a stack underflow occurs -->
	<script>sforthThrowOnUnderflow=true</script>
	<script src="../sforth-runtime.js"></script>
	<script src="../sforth-compiler.js"></script>
</head>
<body onload="forth.compileAllScriptRegions();">
	<!-- include the base system -->
	<script data-src="../forth.fs;../browser.fs" type="application/sforth"></script>

	<script type="application/sforth">
		:js sayHello { } "Hello World!" show-alert ;
	</script>

	<input type="button" value="Say hello!" onclick="sayHello();">
</body>
</html>
```

### comments

```forth
\ line comment
// line comment
( comment )
/* comment */
/** comment */
\\ ignore the rest of the file
```
