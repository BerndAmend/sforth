# sforth

sforth is a script language with a forth like syntax that compiles to javascript.
It allows a seemless integration into normal javascript applications and websites.
See http://tptb.github.io/sforth/

## node.js

Get the source code and start the sforth repl

./sforth

or

node nodeForth.js


## Firefox / Chromium / Google Chrome

The examples require that they are served using a static webserver.
A test webserver is include that only requires node.js.
Start it and follow the printed instructions

./start-webserver.sh

or

node webserver.js


To test the raytracer locally go to http://localhost:8080/examples/raytracer/

Checkout the examples at http://tptb.github.io/sforth/ (https://github.com/tptb/sforth/tree/master/examples)

## Examples
- Hello World http://tptb.github.io/sforth/examples/Hello-World.html
- Web worker http://tptb.github.io/sforth/examples/web-worker.html
- Playground http://tptb.github.io/sforth/examples/editor/
- Raytracer http://tptb.github.io/sforth/examples/raytracer/
- Image processing http://tptb.github.io/sforth/examples/image_processing/

## Syntax

### functions

```forth
	\ normal function
	: function-name ( stack-comment ) body ;
	\ e.g.
	: mul ( x1 x2 -- x ) * ;
	\ using an argument list
	: mul { x1 x2 -- x } x1 x2 * ;

	\ anonymous function - the function is pushed to the stack
	:noname ( stack-comment ) body ;
	\ e.g.
	:noname ( x1 x2 -- x ) * ;
	\ using an argument list
	:noname { x1 x2 -- x ) x1 x2 * ;
	
	\ to simplify the integration into normal javascript applications
	\ normal javascript functions can be defined.
	\ They behave like every javascript function.
	
	\ without a return value
	:js { parameters } body ;
	
	\ with a return value
	:js { parameters } body return;
	
	\ anonymous javascript functions
	:jsnoname { parameters } body ;
	:jsnoname { parameters } body return;
	
	\ push a function reference to the stack
	' function-name
	\ e.g.
	' mul
	
	\ Calling javascript functions from sforth
	\ If you call javascript functions from forth they will take required number of parameters from the data stack
	\ and place the result on the stack
	
```

### variables

```forth
	\ Defining a value
	{ var1 var2 var3 ... -- <comment> }
	<initial-value> value <name>
	\ e.g.
	90 value blobvar

	\ assign something to a value
	<new-value> to <name>
	\ e.g.
	42 to blobvar
```

### strings
```forth
	\ normal strings
	»text«
	
	\ strings without whitespaces
	"text
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
	"foo 31 arr !
	
	\ get a value
	<position> <array> @
	
	\ read the value from position 10 and print it
	10 arr @ .
```

### if
```forth
	<conditition> if
		<code>
	elseif <next-condition> if \ optional
		<code>
	else \ optional
		<code>
	endif
	
	\ example
	0 0 = if
		":) .
	else
		":( .
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
	20 case
		of 20
			":) .
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
		":( new Error throw
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
	
	\ insert the code and terminate it with ;
	:[ <javascript code> ];
```

### embed into html
```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<script>sforthThrowOnUnderflow=true</script> <!-- decide if the stack should throw an error if an stack underflow occurs -->
	<script src="../sforth-runtime.js"></script>
	<script src="../sforth.js"></script>
</head>
<body onload="forth.compileAllScriptRegions();">
	<script data-src="../forth.fs;../browser.fs" type="application/sforth"></script> <!-- include the base system -->

	<script type="application/sforth">
		:js sayHello { } »Hello World!« show-alert ;
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
```
