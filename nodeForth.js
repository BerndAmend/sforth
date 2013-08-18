// example app for nodejs

var rfs = require('fs');

global.eval(rfs.readFileSync('sforth.js').toString());

compiler_message_handler=console.log

global.include = function(stack) {
	var generated_code = forth_compile(rfs.readFileSync(stack.pop()).toString());
	global.eval(generated_code);
}
global.include.forth_function=true;

global.compile = function(stack) {
	stack.push(global.forth_compile(stack.pop()));
}
global.compile.forth_function=true;

stack.push("nodejs.fs")
include(stack);
