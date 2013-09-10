// example app for nodejs

Filesystem = require('fs');

// has to be done in the main file :(
PDFDocument = require("pdfkit");

// PNG = require('pngjs').PNG;

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
// console.log(compiled_code);
global.eval(compiled_code);
