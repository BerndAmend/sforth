// This file only includes everything necessary to bootstrap the rest
// directly from forth files

// TODO implement it in a faster way
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

Number.isNumeric = function( obj ) {
	return !isNaN( parseFloat(obj) ) && isFinite( obj );
}

function cloneMap(other) {
	var result = new Array();
	for (var i in other)
		result[i] = other[i];
	return result;
}

function ForthStack() {
	this.stac=new Array();

	this.pop=function() {
		if(this.isEmpty())
			throw new Error("Stack underflow");
		return this.stac.pop();
	}

	this.size=function(item) {
		return this.stac.length;
	}

	this.push=function(item) {
		this.stac.push(item);
	}

	this.top=function() {
		return this.get(0);
	}

	this.isEmpty=function() {
		return this.stac.length == 0;
	}

	this.get=function(pos) {
		var realpos = this.stac.length-1-pos;
		if(realpos < 0)
			throw new Error("Stack underflow"); //?
		return this.stac[realpos];
	}

	this.remove=function(pos) {
		var realpos = this.stac.length-1-pos;
		if(realpos < 0)
			throw new Error("Stack underflow"); //?
		return this.stac.splice(realpos, 1);
	}

	this.clear=function() {
		this.stac = new Array();
	}

	this.toString=function() {return this.stac;}
}

// Mapping of forth functions to javascript functions
// a pure forth function like
//   : mul2 ( x -- x ) 2 * ;
// is converted into the following function
//   function gff_test1(stack) {
//     if(!stack) stack = new DefaultStacks();
//     stack.d.push(2);
//     gff_$times(stack);
//   }
//
// If you want to write the following javascript function in forth
//   function mul2(num1, num2) {
//     return num1 * num2;
//   }
// you can do that by writing
//   :ps test2 { num1 num2 } num1 num2 * return; // :ps enforces that there is no stack parameter
// which results in the following javascript code
//   function gff_test2(num1, num2) {
//     var stack = new DefaultStacks();
//     stack.d.push(num1);
//     stack.d.push(num2);
//     gff_$times(stack);
//     return stack.d.pop();
//   }
//
// if you call javascript functions from forth they will take required number of parameters from the data stack
// and place the result on the stack
//
// js: javascript -> get the value or function address to to data stack
// jsc: javascript call -> calls the function the required number of parameters is taken from the data stack and the return is pushed
// jssc: javascript stack call -> calls the javascript function on the object that is current stack top
//
// : name code;
// :noname code ; -> function pointer is placed on the stack
// :ps code ( return ) ;
// :psnoname code return; or ;

// 42 Constant THEANSWER
//var THEANSWER = 42;


// 90 Value blobvar
//var blobvar = 90;

// 34 to blobvar
//blobvar = 34;


// { x1 x2 x3 }
//var x1 = stack.d.pop();
//var x2 = stack.d.pop();
//var x3 = stack.d.pop();


// the stack comment is not really a stack comment,
// the compiler uses it to
// :js function { a b c -- } ( code ) return;


// create the global stack
var stack = new ForthStack();

//var Forth = {

var compiler_message_handler = function(str) {}

var forth_mangling = {
	"$": "$dollar",
	"=": "$eq",
	">": "$greater",
	"<": "$less",
	"+": "$plus",
	"-": "$minus",
	"*": "$times",
	"/": "div",
	"!": "$bang",
	"@": "$at",
	"#": "$hash",
	"%": "$percent",
	"^": "$up",
	"&": "$amp",
	"~": "$tilde",
	"?": "$qmark",
	"|": "$bar",
	"\\": "$bslash",
	":": "$colon",
	".": "$period",
	",": "$comma",
	"[": "$obracket",
	"]": "$cbracket",
	"(": "$oparentheses",
	")": "$cparentheses",
	"{": "$obraces",
	"}": "$obraces",
};

function forth_mangleName(str) {
	var result = str; //.toLowerCase();

	if(Number.isNumeric(str.charAt(0))) {
		result = "$" + result;
	}

	for(var s in forth_mangling) {
		result = result.replaceAll(s, forth_mangling[s]);
	}

	return result;
}

function forth_demangleName(str) {
	//if(str.substr(0,forth_mangling_prefix.length) != forth_mangling_prefix)
	//	throw new Error("not a mangled function name");

	var result = str; //str.substr(forth_mangling_prefix.length);

	for(var s in forth_mangling) {
		result = result.replaceAll(forth_mangling[s], s);
	}
	return result; //result.toLowerCase();
}

var forth_types = {
	forth_function: "forth_function",
	constant: "constant",
	value: "value"
}

// defined_vars is used to optimize away unncessary forth calls
function forth_compile(code, line_prefix, level, forth_defined) {
	if(line_prefix == undefined)
		line_prefix = "\t";
	if(level == undefined)
		level = 0;

	if(forth_defined == undefined)
		forth_defined = new Array();

	var lp =  ""
	for(var i = 0; i < level; i++)
		lp += line_prefix;

	function append(str) {
		out += lp + str;
	}

	// unify line endings
	var clean_code = code.replace(/\r\n/gm, '\n')
						.replace(/\n/gm, ' \n ')
						.replace(/\t/gm, ' \t ');

	// tokenize code
	var tokens=clean_code.split(" ");

	var out = "";

	for( var i = 0 ; i < tokens.length; i++ ) {
		var t = tokens[i];
		if(t == "") {
			// ignore empty tokens
		} else if(Number.isNumeric(t)) {
			append("stack.push(" + t + ");\n");
		} else if(t == "\\") { // line comments
			// jump to the next \n
			while(tokens[i] != "\n") i++;
		} else if(t == "\n") {
			// we ignore \n completely
		} else if(t == "\"") { // strings
			var str = ""
			i++;
			while(tokens[i] != "\"") {
				if(tokens[i] == "\n") {
					str += " ";
				} else {
					str += tokens[i] + " ";
				}
				i++;
			}
			append("stack.push(\"" + str.slice(0,str.length-1).replace(/ \t /gm, '\t') + "\");\n");
		} else if(t == "(") { // comment start
			var depth = 1;
			while(depth > 0) {
				i++;
				if(tokens[i] == "(")
					depth++;
				else if(tokens[i] == ")") {
					depth--;
				}
			}
		} else if(t == ")") { // comment end
			compiler_message_handler("unexpected token ) found");
		} else if(t == ":[") { // execute js code start
			var str = ""
			i++;
			while(tokens[i] != "]:" && tokens[i] != "]:d") {
				str += tokens[i] + " ";
				i++;
			}
			if(tokens[i] == "]:")
				append("stack.push(" + str.slice(0,str.length-1).replace(/ \t /gm, '\t') + ");\n");
			else // if(tokens[i] == "]:d")
				append(str.slice(0,str.length-1).replace(/ \t /gm, '\t') + ";\n");
		} else if(t == "]:") { // execute js code end
			compiler_message_handler("unexpected token ]: found");
		} else if(t == "]:d") { // execute js code end
			compiler_message_handler("unexpected token ]: found");
		} else if(t == "{") { // local variable start
			var done = false;
			var localstack = new ForthStack;
			i++;
			while(tokens[i] != "}") {
				if(tokens[i] == "--") {
					done = true;
				}
				if(!done) {
					var mn = forth_mangleName(tokens[i]);
					localstack.push(mn);
					forth_defined[mn] = forth_types.value;
				}
				i++;
			}
			while(!localstack.isEmpty()) {
				append("var " + localstack.pop() + " = stack.pop();\n");
			}
		} else if(t == "}") { // local variable end
			compiler_message_handler("unexpected token } found");
		} else if(t == ":") { // function definition
			var depth = 1;
			var localcode = "";
			i++;

			var function_name = forth_mangleName(tokens[i]);

			forth_defined[function_name] = forth_types.forth_function;

			// get the function name
			append("function " + function_name + "(stack) {\n");

			while(depth > 0) {
				i++;
				if(tokens[i] == ":" || tokens[i] == ":noname" || tokens[i] == ":js") {
					depth++;
				} else if(tokens[i] == ";" || tokens[i] == "return;") {
					depth--;
				} else {
					localcode += tokens[i] + " ";
				}
			}

			append(forth_compile(localcode, line_prefix, level+1, cloneMap(forth_defined)));

			append("}\n");
			append(function_name + ".forth_function=true;\n\n");
			//append(".forth_code=\"" + localcode + "\"\n"));
		} else if(t == ":noname") { // function definition
			// TODO
		} else if(t == ";") {
			compiler_message_handler("unexpected token ; found");
		} else if(t == ":js") { // function definition
			// TODO
		} else if(t == "return;") {
			compiler_message_handler("unexpected token return; found");
		} else if(t == "value") {
			i++
			var mn = forth_mangleName(tokens[i]);
			forth_defined[mn] = forth_types.value;
			append("var " + mn + " = stack.pop();\n");
		} else if(t == "to") {
			i++
			append(tokens[i] + " = stack.pop();\n");
		} else if(t == "constant") {
			i++
			var mn = forth_mangleName(tokens[i]);
			forth_defined[mn] = forth_types.constant;
			append("var " + mn + " = stack.pop();\n");
		} else if( t == "if") {
			var depth = 1

			var thenstr = ""
			var current = ""
			while(depth > 0) {
				i++;
				switch(tokens[i]) {
					case "if":
						depth++;
						current += tokens[i] + " ";
						break;
					case "else":
						if(depth == 1) {
							thenstr = current;
							current = "";
						} else {
							current += tokens[i] + " ";
						}
						break;
					case "then":
					case "endif":
						depth--;
						if(depth > 0)
							current += tokens[i] + " ";
						break;
					default:
						current += tokens[i] + " ";
				}
				//i++;
			}

			var compiledthen = "";
			var compiledelse = "";
			if(thenstr) {
				compiledthen = forth_compile(thenstr, line_prefix, level+1, cloneMap(forth_defined));
				compiledelse = forth_compile(current, line_prefix, level+1, cloneMap(forth_defined));
			} else {
				compiledthen = forth_compile(current, line_prefix, level+1, cloneMap(forth_defined));
			}

			append("if(stack.pop()) {\n")
			append(compiledthen);
			if(compiledelse) {
				append("} else {\n")
				append(compiledelse);
			}
			append("}\n")
		} else if( t == "else") {
			compiler_message_handler("unexpected token else found");
		} else if( t == "then") {
			compiler_message_handler("unexpected token then found");
		} else if( t == "endif") {
			compiler_message_handler("unexpected token endif found");
		} else if( t == "case") {
			// TODO
		} else if( t == "endcase") {
			compiler_message_handler("unexpected token endcase found");
		} else if( t == "of") {
			compiler_message_handler("unexpected token of found");
		} else if( t == "endof") {
			compiler_message_handler("unexpected token endof found");
		} else if( t == "'") {
			i++;
			append("stack.push(" + forth_mangleName(tokens[i]) + ");\n");
		} else {
			// we assume that everything else is a function
			var mangledt = forth_mangleName(t);

			// check if already can decide which type the token has
			switch (forth_defined[mangledt]) {
				case forth_types.forth_function:
					append(mangledt + "(stack);\n");
					break;
				case forth_types.constant:
				case forth_types.value:
					append("stack.push(" + mangledt + ");\n");
					break
				default:
					if(mangledt == 'true' || mangledt == 'false') {
						append("stack.push(" + mangledt + ");\n");
					} else if(mangledt == 'undefined') {
						append("stack.push(" + undefined + ");\n");
					} else if(mangledt == 'null') {
						append("stack.push(" + null + ");\n");
					} else {
						var type = eval("typeof " + mangledt);
						if(type == 'undefined') {
							append("if(typeof " + mangledt + " == 'function') {\n");
							append(line_prefix + "if(" + mangledt + ".forth_function == true) {\n");
							append(line_prefix + line_prefix + mangledt + "(stack);\n");
							append(line_prefix + "} else {\n");
							append(line_prefix + line_prefix + "stack.push(" + mangledt + "());\n");
							append(line_prefix + "}\n");
							append("} else if (typeof " + mangledt + " == 'undefined' ) {\n");
							append(line_prefix  + "console.error('unknown word " + mangledt + "');\n");
							append("} else { \n");
							append(line_prefix + "stack.push(" + mangledt + ");\n");
							append("}\n");
						} else {
							// TODO: allow to disable this case
							if(type == 'function') {
								if(eval(mangledt+".forth_function") == true) {
									append(mangledt + "(stack);\n");
								} else {
									append("stack.push(" + mangledt + "());\n");
								}
							} else if (type == 'undefined' ) {
								console.error("compiler error while processing '" + mangledt + "'");
							} else {
								append("stack.push(" + mangledt + ");\n");
							}
						}
					}
			}
		}
	}

	return out;
}
