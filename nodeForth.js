// example app for nodejs

Filesystem = require('fs');

// has to be done from the main file :(
PDFDocument = require("pdfkit");

//require("./sforth.js");
//require("./sforth-runtime.js");

global.eval(Filesystem.readFileSync('sforth.js').toString());
global.eval(Filesystem.readFileSync('sforth-runtime.js').toString());

compiler_message_handler=console.log

//var tokens = forth.tokenize(Filesystem.readFileSync("nodejs.fs").toString());
//var code_tree = forth.createFromForthTokens(tokens);
//console.log(JSON.stringify(code_tree, null, "\t"));
//console.log(forth.generateJsCode(code_tree));

var compiled_code = forth.compile(Filesystem.readFileSync("nodejs.fs").toString());
// Filesystem.writeFileSync("compiled-nodejs.fs", compiled_code);
global.eval(compiled_code);

// open a simple repl
var readline = require('readline'),
	rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt('> ');
rl.prompt();

rl.on('line', function(line) {
	try {
		global.eval(forth.compile(line));
	} catch(err) {
		console.error(err.stack);
	}
	rl.prompt();
}).on('close', function() {
		console.log('Bye');
		process.exit(0);
	});
