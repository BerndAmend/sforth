// This file only includes everything necessary to bootstrap the rest
// directly from forth files

// TODO optimize functions
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
// TODO move this definitions into another js file
// The generated js code depends on it, not on the compiler
var stack = new ForthStack();

function forthFunctionCall(stack, func, context) {
	if(func.forth_function) {
		func(stack);
	} else {
		var type = typeof func;
		switch(type) {
			case 'function':
				var args = new Array;
				for(var i=0;i<func.length; ++i) {
					args.push(stack.pop());
				}
				args.reverse();
				if(context)
					stack.push(func.apply(context, args));
				else
					stack.push(func.apply(this, args));
				break;
			case 'string':
				var args = new Array;
				for(var i=0;i<func.length; ++i) {
					args.push(stack.pop());
				}
				args.reverse();
				if(context)
					stack.push(eval(func + ".apply(" + context + ", args);"));
				else
					stack.push(eval(func + ".apply(this, args);"));
				break;
			case 'undefined':
				throw new Error("Can not call undefined function");
				break;
			default:
				stack.push(func);
		}
	}
}
// end

var compiler_message_handler = function(str) {}

// We don't allow . in function names
// if you use $ ensure that you don't write one of the following strings
var forth_mangling = {
	"€": "$$euro",
	"=": "$$eq",
	">": "$$greater",
	"<": "$$less",
	"+": "$$plus",
	"-": "$$minus",
	"*": "$$times",
	"/": "$$div",
	"!": "$$bang",
	"@": "$$at",
	"#": "$$hash",
	"%": "$$percent",
	"^": "$$up",
	"&": "$$amp",
	"~": "$$tilde",
	"?": "$$qmark",
	"|": "$$bar",
	"\\": "$$bslash",
	":": "$$colon",
	";": "$$semicolon",
	",": "$$comma",
	"[": "$$obracket",
	"]": "$$cbracket",
	"(": "$$oparentheses",
	")": "$$cparentheses",
	"{": "$$obraces",
	"}": "$$obraces"
};

function forth_mangleName(str) {
	var result = str; //.toLowerCase();

	if(Number.isNumeric(str.charAt(0))) {
		result = "$$" + result;
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

var forth = forth = forth || {};

forth.Types = {
	BranchCase: "BranchCase",
	BranchCaseOf: "BranchCaseOf",
	BranchIf: "BranchIf",
	Body: "Body",
	Call: "Call",
	CommentLine: "CommentLine",
	CommentParentheses: "CommentParentheses",
	Constant: "Constant",
	ConstantValue: "ConstantValue",
	FunctionAddress: "FunctionAddress",
	FunctionForth: "FunctionForth",
	FunctionJs: "FunctionJs",
	JsCode: "JsCode",
	JsCodeWithReturn: "JsCodeWithReturn",
	New: "New",
	Number: "Number",
	String: "String",
	TypeOf: "TypeOf",
	Value: "Value",
	ValueAssign: "ValueAssign",
	ValueLocal: "ValueLocal"
};

forth.BranchCase = function() {
	this.type = forth.Types.BranchCase;
	this.body = new Array;
};

forth.BranchCaseOf = function(condition, body) {
	this.type = forth.Types.BranchCaseOf;
	this.condition = condition;
	this.body = body;
};

forth.BranchIf = function(if_body, else_body) {
	this.type = forth.Types.BranchIf;
	this.if_body = if_body;
	this.else_body = else_body;
};

forth.Body = function() {
	this.type = forth.Types.Body;
	this.body = new Array;
};

forth.Call = function(name) {
	this.type = forth.Types.Call;
	this.name = name;
};

forth.CommentLine = function(comment) {
	this.type = forth.Types.CommentLine;
	this.comment = comment;
};

forth.CommentParentheses = function(comment) {
	this.type = forth.Types.CommentParentheses;
	this.comment = comment;
};

forth.Constant = function(name) {
	this.type = forth.Types.Constant;
	this.name = name;
};

forth.ConstantValue = function(value) {
	this.type = forth.Types.ConstantValue;
	this.value = value;
};

forth.FunctionAddress = function(name) {
	this.type = forth.Types.FunctionAddress;
	this.name = name;
};

forth.FunctionForth = function(name, body) {
	this.type = forth.Types.FunctionForth;
	this.name = name;
	this.body = body;
};

forth.FunctionJs = function(name, args, body) {
	this.type = forth.Types.FunctionJs;
	this.name = name;
	this.args = args;
	this.body = body;
};

forth.JsCode = function(body) {
	this.type = forth.Types.JsCode;
	this.body = body;
};

forth.JsCodeWithReturn = function(body) {
	this.type = forth.Types.JsCodeWithReturn;
	this.body = body;
};

forth.New = function(name) {
	this.type = forth.Types.New;
	this.name = name;
};

forth.Number = function(value) {
	this.type = forth.Types.Number;
	this.value = value;
};

forth.String = function(value) {
	this.type = forth.Types.String;
	this.value = value;
};

forth.TypeOf = function(name) {
	this.type = forth.Types.TypeOf;
	this.name = name;
};

forth.Value = function(name) {
	this.type = forth.Types.Value;
	this.name = name;
};

forth.ValueAssign = function(name) {
	this.type = forth.Types.ValueAssign;
	this.name = name;
};

forth.ValueLocal = function(values, comment) {
	this.type = forth.Types.ValueLocal;
	this.values = values;
	this.comment = comment;
};

// Currently this function only splits the code into tokens
// later version will also keep track where the tokens are fetched from
forth.tokenize = function(code) {
	// unify line endings
	var clean_code = code.replace(/\r\n/gm, '\n')
		.replace(/\n/gm, ' \n ')
		.replace(/\t/gm, ' \t ');

	// tokenize code
	var tokens=clean_code.split(" ");

	return tokens;
}

forth.createFromForthTokens = function(tokens) {
	var out = new forth.Body();

	function add(something) {
		out.body.push(something);
	}

	for( var i = 0 ; i < tokens.length; i++ ) {
		var t = tokens[i];

		switch (t) {
			case "": // ignore empty/whitespace tokens
			case "\n":
				break;
			case "\\": // line comments
				var str = "";
				while(tokens[i] != "\n") {
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing '\n'");

					if(tokens[i] != "\n")
						str += tokens[i] + " ";
				}
				add(new forth.CommentLine(str.slice(0,str.length-1)));
				break;
			case "\"": // strings
				var str = "";
				i++;
				while(tokens[i] != "\"") {
					if(tokens[i] == "\n") {
						str += " ";
					} else {
						str += tokens[i] + " ";
					}
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing ')'");
				}
				add(new forth.String(str.slice(0,str.length-1).replace(/ \t /gm, '\t')));
				break;

			case ".":
				add(new forth.Call("print"));
				break;
			case ".s":
				add(new forth.Call("printStack"));
				break;
			case "true":
				add(new forth.ConstantValue(true));
				break;
			case "false":
				add(new forth.ConstantValue(false));
				break;
			case "undefined":
				add(new forth.ConstantValue(undefined));
				break;
			case "null":
				add(new forth.ConstantValue(null));
				break;
			case "typeof":
				i++;
				if(i >= tokens.length)
					throw new Error("Couldn't find parameter'");
				add(new forth.TypeOf(tokens[i]));
				break;

			case "(": // comment start
				var str = ""
				var depth = 1;
				while(depth > 0) {
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing ')'");

					if(tokens[i] == "(")
						depth++;
					else if(tokens[i] == ")") {
						depth--;
					}

					if(depth > 0)
						str += tokens[i] + " ";
				}
				add(new forth.CommentParentheses(str.slice(0, str.length-1)));
				break;
			case ":[": // execute js code start
				var str = ""
				i++;
				while(tokens[i] != "]:" && tokens[i] != "]:d") {
					str += tokens[i] + " ";
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing ']:' or ']:d'");
				}
				var localjscode = str.slice(0,str.length-1).replace(/ \t /gm, '\t');
				if(tokens[i] == "]:")
					add(new forth.JsCodeWithReturn(localjscode));
				else // if(tokens[i] == "]:d")
					add(new forth.JsCode(localjscode));
				break;

			case "new":
				i++;
				if(i >= tokens.length)
					throw new Error("Couldn't find closing ')'");
				add(new forth.New(tokens[i]));
				break;
			case "value":
				i++;
				if(i >= tokens.length)
					throw new Error("Couldn't find closing ')'");
				add(new forth.Value(tokens[i]));
				break;
			case "to":
				i++;
				if(i >= tokens.length)
					throw new Error("Couldn't find closing ')'");
				add(new forth.ValueAssign(tokens[i]));
				break;
			case "constant":
				i++;
				if(i >= tokens.length)
					throw new Error("Couldn't find closing ')'");
				add(new forth.Constant(tokens[i]));
				break;
			case "if":
				var depth = 1

				var thenstr = null;
				var current = new Array;
				while(depth > 0) {
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing ')'");

					switch(tokens[i]) {
						case "if":
							depth++;
							current.push(tokens[i]); // + " ";
							break;
						case "else":
							if(depth == 1) {
								thenstr = current;
								current = new Array;
							} else {
								current.push(tokens[i]); + " ";
							}
							break;
						case "then":
						case "endif":
							depth--;
							if(depth > 0)
								current.push(tokens[i]); // + " ";
							break;
						default:
							current.push(tokens[i]); // + " ";
					}
					//i++;
				}

				var compiledthen = null;
				var compiledelse = null;
				if(thenstr) {
					compiledthen = forth.createFromForthTokens(thenstr);
					compiledelse = forth.createFromForthTokens(current);
				} else {
					compiledthen = forth.createFromForthTokens(current);
				}
				add(new forth.BranchIf(compiledthen, compiledelse));
				break;
			case "case":
				// TODO
				break;
			case "include":
				// :( copied from the string detection
				var str = ""
				i++;

				if(i >= tokens.length)
					throw new Error("Couldn't find closing ')'");

				while(tokens[i] != "\"") {
					if(tokens[i] == "\n") {
						str += " ";
					} else {
						str += tokens[i] + " ";
					}
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing ')'");
				}

				var filename = str.slice(0,str.length-1).replace(/ \t /gm, '\t');
				add(forth.createFromForth(Filesystem.readFileSync(filename).toString()));
				break;
			case "'":
				i++;

				if(i >= tokens.length)
					throw new Error("Couldn't find closing ')'");

				add(new forth.FunctionAddress(tokens[i]));
				break;

			case "{": // local variable start
				var done = false;
				var localvars = new Array;
				var comment = "";
				i++;
				while(tokens[i] != "}") {
					if(tokens[i] == "--") {
						done = true;
						i++;
						continue;
					}
					if(!done) {
						localvars.push(tokens[i]);
					} else {
						comment += tokens[i] + " ";
					}
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing ')'");
				}
				add(new forth.ValueLocal(localvars.reverse(), comment.slice(0, comment.length-1)));
				break;
			case ":": // function definition
				var depth = 1;
				i++;

				if(i >= tokens.length)
					throw new Error("Couldn't find closing ')'");

				var function_name = tokens[i];

				if(function_name.indexOf(".") != -1)
					throw new Error("Function names can not contain .");

				var localtokens = new Array;

				while(depth > 0) {
					i++;
					if(tokens[i] == ":" || tokens[i] == ":noname" || tokens[i] == ":js") {
						depth++;
					} else if(tokens[i] == ";" || tokens[i] == "return;") {
						depth--;
					}
					if(depth > 0)
						localtokens.push(tokens[i]);
				}

				add(new forth.FunctionForth(function_name, forth.createFromForthTokens(localtokens)));
				break;
			case ":noname": // function definition
				// TODO
				break;
			case ":js": // function definition
				// TODO
				break;

			// forbidden tokens
			case ")": // comment end
			case "]:": // execute js code end
			case "]:d": // execute js code end
			case "else":
			case "then":
			case "endif":
			case "endcase":
			case "of":
			case "endof":
			case ";":
			case "return;":
			case "}": // local variable end
				compiler_message_handler("Unexpected token " + t + " found");
				break;
			default:
				if(Number.isNumeric(t)) {
					add(new forth.Number(t));
				} else {
					add(new forth.Call(t));
				}
		}
	}

	return out;
};

forth.createFromForth = function(code) {
	return forth.createFromForthTokens(forth.tokenize(code));
};

forth.generateForthCode = function(code_tree) {
	// TODO
};

forth.generateJsCode = function(code_tree, indent_characters) {
	if(indent_characters == undefined)
		indent_characters = "\t";

	// We could optimize away many forthFunctionCall calls
	// by keeping tracking how to call a function/value/constant
	// in practice this is much harder than it looks since
	// every variable in javascript that gets a function assigned
	// behaves like a function
	function generateCode(code_tree, level) {

		var out = "";

		var lp =  "";
		for(var i = 0; i < level; i++)
			lp += indent_characters;

		function append(str) {
			if(str && str != "")
				out += lp + str + "\n";
		}

		switch(code_tree.type) {
			case forth.Types.BranchCase:
			case forth.Types.BranchCaseOf:
				break;
			case forth.Types.BranchIf:
				append("if(stack.pop()) {")
				out += generateCode(code_tree.if_body, level);
				if(code_tree.else_body) {
					append("} else {")
					out += generateCode(code_tree.else_body, level);
				}
				append("}")
				break;
			case forth.Types.Body:
				code_tree.body.forEach(function(entry) {
					out += generateCode(entry, level+1);
				});
				break;
			case forth.Types.Call:
				var name = forth_mangleName(code_tree.name);
				var splitted = name.split(".");
				var ctxt = splitted.slice(0, splitted.length-1).join(".");
				if(ctxt && ctxt != "") {
					if(splitted[0] == "$stack") {
						var rest = splitted.slice(1).join(".");
						append("forthFunctionCall(stack, \"" + rest + "\", stack.pop());");
					} else {
						append("forthFunctionCall(stack," + name + ", " + ctxt + ");");
					}
				} else {
					append("forthFunctionCall(stack," + name + ");");
				}
				break;

			// we ignore CommentLines and CommentParentheses
			case forth.Types.CommentLine:
			case forth.Types.CommentParentheses:
				break;

			case forth.Types.Constant:
				var name = forth_mangleName(code_tree.name);
				//forth_defined[mn] = forth.types.constant;
				append("var " + name + " = stack.pop();");
				break;
			case forth.Types.ConstantValue:
				append("stack.push(" + code_tree.value + ");");
				break;
			case forth.Types.FunctionAddress:
				var name = forth_mangleName(code_tree.name);
				append("stack.push(" + name + ");");
				break;
			case forth.Types.FunctionForth:
				//forth_defined[function_name] = forth.types.forth_function;
				var name = forth_mangleName(code_tree.name);
				append("function " + name + "(stack) {");
				out += generateCode(code_tree.body, level);
				append("}");
				append(name + ".forth_function=true;\n");
				break;
			case forth.Types.FunctionJs:
				break;
			case forth.Types.JsCode:
				var clean = code_tree.body.replaceAll(" ", "").replaceAll("\t", "").replaceAll("\n", "");
				if(clean && clean != "")
					append(code_tree.body + ";");
				break;
			case forth.Types.JsCodeWithReturn:
				append("stack.push(" + code_tree.body + ");");
				break;
			case forth.Types.New:
				append("stack.push(new " + code_tree.name + ");");
				break;
			case forth.Types.Number:
				append("stack.push(" + code_tree.value + ");");
				break;
			case forth.Types.String:
				append("stack.push(\"" + code_tree.value + "\");");
				break;
			case forth.Types.TypeOf:
				append("stack.push(typeof " + code_tree.name + ");");
				break;
			case forth.Types.Value:
				//forth_defined[mn] = forth.types.value;
				var name = forth_mangleName(code_tree.name);
				append("var " + name + " = stack.pop();");
				break;
			case forth.Types.ValueAssign:
				var name = forth_mangleName(code_tree.name);
				append(name + " = stack.pop();");
				break;
			case forth.Types.ValueLocal:
				code_tree.values.forEach(function(entry) {
					var name = forth_mangleName(entry);
					//forth_defined[name] = forth.types.value;
					append("var " + name + " = stack.pop();");
				});
				break;
			default:
				console.log("Unknown type=" + code_tree.type);
				//console.log("Unknown " + JSON.stringify(code_tree, null, "\t"));
		}

		return out;
	}

	return generateCode(code_tree, -1);
};

function forth_compile(code) {
	var tokens = forth.tokenize(code)
	var code_tree = forth.createFromForthTokens(tokens);
	var generated_code = forth.generateJsCode(code_tree);
	return generated_code;
}
