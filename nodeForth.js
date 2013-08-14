// example app for nodejs

var fs = require('fs');

eval(fs.readFileSync('sforth.js').toString());

Forth.compiler_message_handler=console.log

function forth_include(filename) {
	Forth.forth_run(fs.readFileSync(filename).toString());
}

// we should add the function to our forth compiler
forth_include("forth.fs");
//forth_include("float.fs");
forth_include("time.fs");