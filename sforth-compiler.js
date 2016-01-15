"use strict";
/**
The MIT License (MIT)

Copyright (c) 2013-2016 Bernd Amend <bernd.amend+sforth@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function(exports){

// Helper functions
String.prototype.replaceAll = function(search, replacement) {
    return this.split(search).join(replacement);
};

String.prototype.replaceWholeWord = function(search, replacement, ch) {
    let target = this;
	ch = ch || [" ", "\t", "\n"];
	for(let i=0;i<ch.length;++i)
		for(let j=0;j<ch.length;++j)
			target = target.split(ch[i] + search + ch[j]).join(ch[i] + replacement + ch[j]);

	// handle the case where the search word is at the beginning
	if(target.substr(0, search.length) == search)
		target = replacement + target.substr(search.length);

	// or the end
	if(target.substr(target.length - search.length) == search)
		target = target.substr(0, target.length - search.length) + replacement;

	return target;
};

function isNumeric( obj ) {
	return !isNaN( parseFloat(obj) ) && isFinite( obj );
}

function cloneObject(other) {
	return JSON.parse(JSON.stringify(other));
};

function SForthStackCode(throwOnUnderflow) {
	function SForthStack() {
		this.stac=new Array(32);
		this.pos = -1;
	}

	if(throwOnUnderflow) {
		SForthStack.prototype.pop=function() {
			if(this.pos == -1)
				throw new Error("Stack underflow");
			return this.stac[this.pos--];
		};

		SForthStack.prototype.getTopElements=function(count) {
			let realpos = this.pos-count+1;
			if(realpos < 0)
				throw new Error("Stack underflow");
			this.pos -= count;
			return this.stac.slice(realpos, realpos+count);
		};

		SForthStack.prototype.remove=function(pos) {
			let realpos = this.pos-pos;
			if(realpos < 0)
				throw new Error("Stack underflow"); //?
			--this.pos;
			return this.stac.splice(realpos, 1)[0];
		};
	} else {
		SForthStack.prototype.pop=function() {
			return this.stac[this.pos--];
		};

		SForthStack.prototype.getTopElements=function(count) {
			let realpos = this.pos-count+1;
			this.pos -= count;
			return this.stac.slice(realpos, realpos+count);
		};

		SForthStack.prototype.remove=function(pos) {
			--this.pos;
			return this.stac.splice(this.pos-pos, 1)[0];
		};
	}

	SForthStack.prototype.push=function(item) {
		this.stac[++this.pos] = item;
	};

	SForthStack.prototype.pushIfNotUndefined=function(item) {
		if(item !== undefined)
			this.stac[++this.pos] = item;
	};

	SForthStack.prototype.isEmpty=function() {
		return this.pos == -1;
	};

	SForthStack.prototype.size=function() {
		return this.pos+1;
	};

	SForthStack.prototype.top=function() {
		return this.get(0);
	};

	SForthStack.prototype.get=function(pos) {
		let realpos = this.pos-pos;
		if(realpos < 0)
			throw new Error("Stack underflow");
		return this.stac[realpos];
	};

	SForthStack.prototype.clear=function() {
		this.stac = new Array(32);
		this.pos = -1;
	};

	SForthStack.prototype.getArray=function() {
		return this.stac.slice(0,Math.max(this.pos+1,0));
	};

	SForthStack.prototype.toString=function() {
		return this.getArray().toString();
	};

	SForthStack.prototype.toJSON=function() {
		return JSON.stringify(this.getArray());
	};

	SForthStack.prototype.fromJSON=function(str) {
		let l = JSON.parse(str);
		this.clear();
		for(let i=0;i<l.length;++i)
			this.push(l[i]);
	};
    return SForthStack;
}

// We don't allow . in function names
// if you use $ ensure that you don't write one of the following strings
const Mangling = {
	Characters: {
		"\u20ac": "$$euro",
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
		"}": "$$cbraces",
		"\u00b7": "$$middot",
		"\"": "$$quotationmark",
		"'": "$$apostrophe",
		"°": "$$degree"
	},

	mangle: function(str) {
		let result = str;

		const start = str.charAt(0);
		if(start >= '0' && start <= '9') {
			result = "$$" + result;
		}

		for(let s in Mangling.Characters) {
			if (Mangling.Characters.hasOwnProperty(s)) {
				result = result.replaceAll(s, Mangling.Characters[s]);
			}
		}

		if(result[0] == ".")
			result = "$$dot" + result.substr(1);
		if(result[result.length-1] == ".")
			result = "$$dot" + result.substr(0, result.length-1);

		return result;
	},

	demangle: function(str) {
		let result = str;
		for(let s in Mangling.Characters) {
			if (Mangling.Characters.hasOwnProperty(s)) {
				result = result.replaceAll(Mangling.Characters[s], s);
			}
		}

		result = result.replaceAll("$$dot", ".");

		if(result.startsWith("$$") && result.charAt(2) >= '0' && result.charAt(2) <= '9') {
			result = result.substr(2);
		}

		return result;
	}
};
exports.Mangling = Mangling;

let AST = {};
exports.AST = AST;

AST.Types = {
	BeginAgain: "BeginAgain",
	BeginUntil: "BeginUntil",
	BeginWhileRepeat: "BeginWhileRepeat",
	BranchCase: "BranchCase",
	BranchCaseOf: "BranchCaseOf",
	BranchIf: "BranchIf",
	BranchIfBody: "BranchIfBody",
	Body: "Body",
	Call: "Call",
	CommentLine: "CommentLine",
	CommentParentheses: "CommentParentheses",
	DoLoop: "DoLoop",
	FunctionForth: "FunctionForth",
	FunctionForthAnonymous: "FunctionForthAnonymous",
	FunctionJs: "FunctionJs",
	FunctionJsAnonymous: "FunctionJsAnonymous",
	JsCode: "JsCode",
	JsCodeDirect: "JsCodeDirect",
	JsCodeWithReturn: "JsCodeWithReturn",
	Macro: "Macro",
	Number: "Number",
	Screen: "Screen",
	String: "String",
	Token: "Token",
	TryCatchFinally: "TryCatchFinally",
	ValueLocal: "ValueLocal",
	ValueLocalTemp: "ValueLocalTemp",
	ValueToStack: "ValueToStack",

	// elements generated by the optimizer

	// the following elements add the element value to the JsCodeWithReturn object instances
	JsCodeWithReturnToVar: "JsCodeWithReturnToVar",
	JsCodeWithReturnToVarTemp: "JsCodeWithReturnToVarTemp",
	JsCodeWithReturnAssignToVar: "JsCodeWithReturnAssignToVar",
	JsCodeWithReturnAddToVar: "JsCodeWithReturnAddToVar",

	// new element name
	NumberToVar: "NumberToVar",
	NumberToVarTemp: "NumberToVarTemp",
	NumberAssignToVar: "NumberAssignToVar",
	NumberAddToVar: "NumberAddToVar",
	StringToVar: "StringToVar",
	StringToVarTemp: "StringToVarTemp",
	StringAssignToVar: "StringAssignToVar",
	StringAddToVar: "StringAddToVar",

	Empty: "Empty"
};

(function() {
	AST.Position = class Position {
		constructor(line, column) {
			this.line = line;
			this.column = column;
		}
	};

	AST.SourceLocation = class SourceLocation {
		constructor(source, line, column) {
			this.source = source;
			this.start = start;
			this.end = end;
		}
	};

	AST.Node = class Node {
		constructor(type) {
			this.type = type.name;
		}
	};

	AST.BeginAgain = class BeginAgain extends AST.Node {
		constructor(body) {
			super(BeginAgain);
			this.body = body;
		}
	};

	AST.BeginUntil = class BeginUntil extends AST.Node {
		constructor(body) {
			super(BeginUntil);
			this.body = body;
		}
	};

	AST.BeginWhileRepeat = class BeginWhileRepeat extends AST.Node {
		constructor(condition, body) {
			super(BeginWhileRepeat);
			this.condition = condition;
			this.body = body;
		}
	};

	AST.BranchCase = class BranchCase extends AST.Node {
		constructor(body, defaultOf) {
			super(BranchCase);
			this.body = body;
			this.defaultOf = defaultOf;
		}
	};

	AST.BranchCaseOf = class BranchCaseOf extends AST.Node {
		constructor(condition, body) {
			super(BranchCaseOf);
			this.condition = condition;
			this.body = body;
		}
	};

	AST.BranchIfBody = class BranchIfBody extends AST.Node {
		constructor(condition, body) {
			super(BranchIfBody);
			this.condition = condition;
			this.body = body;
		}
	};

	AST.BranchIf = class BranchIf extends AST.Node {
		constructor(if_body, else_if_bodies, else_body) {
			super(BranchIf);
			this.if_body = if_body;
			this.else_if_bodies = else_if_bodies;
			this.else_body = else_body;
		}
	};

	AST.Body = class Body extends AST.Node {
		constructor() {
			super(Body);
			this.body = [];
		}
	};

	AST.Call = class Call extends AST.Node {
		constructor(name, argument_count, drop_result) {
			super(Call);
			this.name = name;
			this.argument_count = argument_count; // optional, specifies how many arguments should be passed to a js function
			this.drop_result = drop_result; // optional
		}
	};

	AST.CommentLine = class CommentLine extends AST.Node {
		constructor(comment) {
			super(CommentLine);
			this.comment = comment;
		}
	};

	AST.CommentParentheses = class CommentParentheses extends AST.Node {
		constructor(comment) {
			super(CommentParentheses);
			this.comment = comment;
		}
	};

	AST.DoLoop = class DoLoop extends AST.Node {
		constructor(index, body, compareOperation) {
			super(DoLoop);
			this.index = index;
			this.compareOperation = compareOperation;
			this.increment = null;
			this.body = body;
		}
	};

	AST.FunctionForth = class FunctionForth extends AST.Node {
		constructor(name, body) {
			super(FunctionForth);
			this.name = name;
			this.body = body;
		}
	};

	AST.FunctionForthAnonymous = class FunctionForthAnonymous extends AST.Node {
		constructor(body) {
			super(FunctionForthAnonymous);
			this.body = body;
		}
	};

	AST.FunctionJs = class FunctionJs extends AST.Node {
		constructor(name, args, body, returnValue) {
			super(FunctionJs);
			this.name = name;
			this.args = args;
			this.body = body;
		}
	};

	AST.FunctionJsAnonymous = class FunctionJsAnonymous extends AST.Node {
		constructor(args, body, returnValue) {
			super(FunctionJsAnonymous);
			this.args = args;
			this.body = body;
		}
	};

	AST.JsCode = class JsCode extends AST.Node {
		constructor(body) {
			super(JsCode);
			this.body = body;
		}
	};

	AST.JsCodeDirect = class JsCodeDirect extends AST.Node {
		constructor(body) {
			super(JsCodeDirect);
			this.body = body;
		}
	};

	AST.JsCodeWithReturn = class JsCodeWithReturn extends AST.Node {
		constructor(body) {
			super(JsCodeWithReturn);
			this.body = body;
		}
	};

	AST.Macro = class Macro extends AST.Node {
		constructor(name, args, body) {
			super(Macro);
			this.name = name;
			this.args = args;
			this.body = body;
		}
	};

	AST.Number = class Number extends AST.Node {
		constructor(value) {
			super(Number);
			this.value = value;
		}
	};

	AST.Screen = class Screen extends AST.Node {
		constructor(comment) {
			super(Screen);
			this.comment = comment;
		}
	};

	AST.String = class String extends AST.Node {
		constructor(value, interpolate) {
			super(String);
			this.value = value;
			this.interpolate = interpolate;
		}
	};

	AST.Token = class Token extends AST.Node {
		constructor(value) {
			super(Token);
			this.value = value;
		}
	};

	AST.TryCatchFinally = class TryCatchFinally extends AST.Node {
		constructor(body, catchVar, catchBody, finallyBody) {
			super(TryCatchFinally);
			this.body = body;
			this.catchVar = catchVar;
			this.catchBody = catchBody;
			this.finallyBody = finallyBody;
		}
	};

	AST.ValueLocalTemp = class ValueLocalTemp extends AST.Node {
		constructor(values, comment) {
			super(ValueLocalTemp);
			this.values = values;
			this.comment = comment;
		}
	};

	AST.ValueLocal = class ValueLocal extends AST.Node {
		constructor(values, comment) {
			super(ValueLocal);
			this.values = values;
			this.comment = comment;
		}
	};

	AST.ValueToStack = class ValueToStack extends AST.Node {
		constructor(name) {
			super(ValueToStack);
			this.name = name;
		}
	};
})();

// Compiler
class Compiler {
	constructor(options) {
		this.options = options || Compiler.getDefaultOptions();
		this.macros = {};
		this.includedFiles = [];
		this.info = console.log;
		this.runtimeProvided = false;
	}

	static getDefaultOptions() {
		return {
			includeDirectories: ["."],
			verbose: false,
			embedSourceMap: true,
			includeSameFileOnlyOnce: true,
			sforthThrowOnUnderflow: true,
			pseudoConst: false
		};
	};

	// uses either the node.js FileSystem or the XHttp Api is used
	loadFile(filename) {
		if(typeof Filesystem === "undefined") {
			throw new Error("loading of files is not available e.g. if used inside a web browser");
		}
		for (let i of this.options.includeDirectories ) {
			let fullfilename = i + "/" + filename;
			if(Filesystem.existsSync(fullfilename)) {
				return Filesystem.readFileSync(fullfilename).toString();
			} else {
				throw new Error(`Could not load file ${filename}`);
			}
		}
	}

	// Currently this function only splits the code into tokens
	// later version will also keep track where the tokens are fetched from
	tokenize(code) {
		// unify line endings
		let clean_code = code.replace(/\r\n/gm, '\n')
			.replace(/\n/gm, ' \n ')
			.replace(/\t/gm, ' \t ')
			.replace(/\r/gm, ' \n ');

		// tokenize code
		let tokens=clean_code.split(" ");

		// merge tokens
		let merged_tokens = [];

		function add(something) {
			merged_tokens.push(something);
		}

		let depth;

		let line = 0;
		let column = 0;

		for( let i = 0 ; i < tokens.length; i++ ) {
			let t = tokens[i];
			depth = 1;

			switch (t.toLowerCase()) {
				case "": // ignore empty/whitespace tokens
				case "\n":
				case "\t":
				case "\r": {
					break;
				}

	            case "////": { // start a new screen
                    let str = "";
	                while(tokens[i] != "\n") {
						i++;

						if(i >= tokens.length)
							break;

						if(tokens[i] != "\n")
							str += tokens[i] + " ";
					}
					add(new AST.Screen(str.slice(0,str.length-1)));
	                break;
	            }

				case "\\\\": { // \\ comments
					let str = "";
					i++;
					while(i < tokens.length) {
						str += tokens[i] + " ";
						i++;

	                    if(i+1 < tokens.length && tokens[i+1] == "////") {
	                        break;
	                    }
					}
					add(new AST.CommentParentheses(str.slice(0, str.length-1)));
					break;
				}

				case "\\": // line comments
				case "//": {
					let str = "";
					while(tokens[i] != "\n") {
						i++;

						if(i >= tokens.length)
							break;

						if(tokens[i] != "\n")
							str += tokens[i] + " ";
					}
					add(new AST.CommentLine(str.slice(0,str.length-1)));
					break;
				}

				case "(": { // comment start
					let str = "";
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
					add(new AST.CommentParentheses(str.slice(0, str.length-1)));
					break;
				}

				case "/*": // comment start
				case "/**": {
					let str = "";
					while(depth > 0) {
						i++;

						if(i >= tokens.length)
							throw new Error("Couldn't find closing '*/'");

						if(tokens[i] == "/*" || tokens[i] == "/**")
							depth++;
						else if(tokens[i] == "*/") {
							depth--;
						}

						if(depth > 0)
							str += tokens[i] + " ";
					}
					add(new AST.CommentParentheses(str.slice(0, str.length-1)));
					break;
				}

				case ":[": { // execute js code start
					let str = "";
					i++;
					while(tokens[i] != "]:" && tokens[i] != "]:d" && tokens[i] != "];") {
						str += tokens[i] + " ";
						i++;

						if(i >= tokens.length)
							throw new Error("Couldn't find closing ']:' or ']:d' or '];' for ':[");
					}
					let localjscode = str.slice(0,str.length-1).replace(/ \t /gm, '\t');
					if(tokens[i] == "]:")
						add(new AST.JsCodeWithReturn(localjscode));
					else if(tokens[i] == "]:d")
						add(new AST.JsCodeDirect(localjscode));
					else //if(tokens[i] == "];")
						add(new AST.JsCode(localjscode));
					break;
				}

				case "{": // local variable start
				case "local{": { // local variable start
					let start = tokens[i];
					let done = false;
					let localvars = [];
					let comment = "";
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
							throw new Error("Couldn't find closing '}' for '"+start+"'");
					}
					switch(start) {
						case "{":
							add(new AST.ValueLocal(localvars.reverse(), comment.slice(0, comment.length-1)));
							break;
						case "local{":
							add(new AST.ValueLocalTemp(localvars.reverse(), comment.slice(0, comment.length-1)));
							break;
					}
					break;
				}

				case "{}": {
					add(new AST.ValueLocal([], ""));
					break;
				}
				default: {
					let replacedcommawithperiod = t.replaceAll(",", ".");
					if(isNumeric(replacedcommawithperiod)) {
						add(new AST.Number(replacedcommawithperiod));
					} else if(t[0] == "'" && t.length == 2) {
						add(new AST.Number(t.charCodeAt(1)));
					} else if(t[0] == "\"") {
						let escapecounter = 0;
						let j=0;
						let str = "";
						while(true) {
							if(tokens[i].length-1==j || tokens[i].length == 0) {
								j=0;
								i++;
								if(i >= tokens.length)
									throw new Error("Couldn't find '\"'");
								str += " ";
								if(tokens[i].length == 0)
									continue;
							} else {
								j++;
							}

							if(tokens[i][j] == "\\") {
								escapecounter++;
							} else {
								for(let k=0;k<escapecounter;k++)
									str += "\\";
								if(escapecounter % 2 == 0 && tokens[i][j] == "\"")
									break;
								escapecounter=0;
								str += tokens[i][j];
							}
						}

						add(new AST.String(str.slice(0,str.length)
												.replace(/ \n /gm, '\\n')
												.replace(/ \t /gm, '\\t')
												.replace(/ \r /gm, '\\r'), false)
							);
					} else if(t[0] == "`") {
						let escapecounter = 0;
						let j=0;
						let str = "";
						while(true) {
							if(tokens[i].length-1==j || tokens[i].length == 0) {
								j=0;
								i++;
								if(i >= tokens.length)
									throw new Error("Couldn't find '`'");
								str += " ";
								if(tokens[i].length == 0)
									continue;
							} else {
								j++;
							}

							if(tokens[i][j] == "\\") {
								escapecounter++;
							} else {
								for(let k=0;k<escapecounter;k++)
									str += "\\";
								if(escapecounter % 2 == 0 && tokens[i][j] == "`")
									break;
								escapecounter=0;
								str += tokens[i][j];
							}
						}

						add(new AST.String(str.slice(0,str.length)
												.replace(/ \n /gm, '\\n')
												.replace(/ \t /gm, '\\t')
												.replace(/ \r /gm, '\\r'), true)
							);
					} else if(t[0] == "\u00bb") { // »
						let str = "";
						if(tokens[i].substr(tokens[i].length-1) == "\u00ab" && // «
							tokens[i].substr(tokens[i].length-2) != "\\\u00ab" // «
						) {
							str = tokens[i].substr(1,tokens[i].length-1);
						} else {
							str = tokens[i].substr(1) + " ";
							i++;
							while(true) {
								if(tokens[i].substr(tokens[i].length-1) == "\u00ab" && // «
									tokens[i].substr(tokens[i].length-2) != "\\\u00ab" // «
								) {
									if(tokens[i].length == 1)
										str += " ";
									else
										str += tokens[i];
									break;
								} else {
									str += tokens[i] + " ";
								}
								i++;

								if(i >= tokens.length)
									throw new Error("Couldn't find closing '\u00ab' for '\u00bb'");
							}
						}
						add(new AST.String(str.slice(0,str.length-1)
												.replace(/ \n /gm, '\\n')
												.replace(/ \t /gm, '\\t')
												.replace(/ \r /gm, '\\r')
												.replaceAll("\"", "\\\"")
												.replaceAll("\\\u00bb", "\u00bb")
												.replaceAll("\\\u00ab", "\u00ab"), false)
							);
					} else if(t[0] == "$" && t.length >= 2) { // handle hex numbers
						add(new AST.Number("0x" + t.substr(1)));
					} else if(t[0] == "%" && t.length >= 2) { // handle binary numbers
						add(new AST.Number(parseInt(t.substr(1),2)));
					} else {
						add(new AST.Token(t));
					}
				}
			}
		}

		return merged_tokens;
	};

	createFromForthTokens(tokens) {

		let out = new AST.Body();

		function add(something) {
			out.body.push(something);
		}

		let current;
		let depth;
		let localtree;
		let args;
		let function_name;
		let returnValue;
		let token_handled;
		let values;

		for( let i = 0 ; i < tokens.length; i++ ) {
			let t = tokens[i];

			depth = 1;
			current = [];
			localtree = null;
			args = null;
			function_name = null;
			returnValue = false;
			values = null;

			token_handled = false;

			switch(t.type) {
				case AST.Types.CommentLine:
				case AST.Types.CommentParentheses:
				case AST.Types.JsCodeWithReturn:
				case AST.Types.JsCodeDirect:
				case AST.Types.JsCode:
				case AST.Types.ValueLocal:
				case AST.Types.ValueLocalTemp:
				case AST.Types.Number:
	            case AST.Types.Screen:
				case AST.Types.String:
					add(t);
					token_handled = true;
					break;
			}

			if(token_handled)
				continue;

			switch (t.value.toLowerCase()) {
				case "if": {
					let tokensIf = current;
					let tokensElseIf = null;
					let tokensElse = null;

					while(depth > 0) {
						i++;

						if(i >= tokens.length) {
							throw new Error("Couldn't find closing 'endif/then' for 'if' tokens=" + JSON.stringify(tokens));
						}

						if(tokens[i].type !== AST.Types.Token) {
							current.push(tokens[i]);
							continue;
						}

						switch(tokens[i].value.toLowerCase()) {
							case "if":
								depth++;
								current.push(tokens[i]);
								break;
							case "elseif":
								if(depth == 1) {
									if(!tokensElseIf)
										tokensElseIf = [];

									var elseIf = new AST.BranchIfBody([], []);
									tokensElseIf.push(elseIf);

									current = elseIf.condition;
									// scan for the next if
									while(true) {
										i++;
										if(i >= tokens.length) {
											throw new Error("Couldn't find closing 'if' for 'elseif' tokens=" + JSON.stringify(tokens));
										}
										if(tokens[i].type === AST.Types.Token && tokens[i].value.toLowerCase() == "if")
											break;

										current.push(tokens[i]);
									}

									current = elseIf.body;
									//this.info("current=" + JSON.stringify(elseIf));
								} else {
									current.push(tokens[i]);
								}
								break;
							case "else":
								if(depth == 1) {
									tokensElse = [];
									current = tokensElse;
								} else {
									current.push(tokens[i]);
								}
								break;
							case "then":
							case "endif":
								depth--;
								if(depth > 0)
									current.push(tokens[i]);
								break;
							default:
								current.push(tokens[i]);
						}
					}

					let compiledIf = null;
					let compiledElseIf = null;
					let compiledElse = null;

					if(tokensIf)
						compiledIf = this.createFromForthTokens(tokensIf);

					if(tokensElseIf) {
						/*jshint loopfunc:true */
						compiledElseIf = [];
						tokensElseIf.forEach((entry) => {
							let condition = this.createFromForthTokens(entry.condition);
							let body = this.createFromForthTokens(entry.body);
							compiledElseIf.push(new AST.BranchIfBody(condition, body));
						});
					}

					if(tokensElse)
						compiledElse = this.createFromForthTokens(tokensElse);

					add(new AST.BranchIf(compiledIf, compiledElseIf, compiledElse));
					break;
				}

				case "try": {
					let tokensBody = current;
					let tokensCatch = null;
					let tokensFinally = null;

					let catchVar = null;

					while(depth > 0) {
						i++;

						if(i >= tokens.length) {
							throw new Error("Couldn't find 'endtry' for 'try' tokens=" + JSON.stringify(tokens));
						}

						if(tokens[i].type !== AST.Types.Token) {
							current.push(tokens[i]);
							continue;
						}

						switch(tokens[i].value.toLowerCase()) {
							case "try":
								depth++;
								current.push(tokens[i]);
								break;
							case "catch":
								if(depth == 1) {
									i++;
									catchVar = tokens[i].value;
									tokensCatch = [];
									current = tokensCatch;
								} else {
									current.push(tokens[i]);
								}
								break;
							case "finally":
								if(depth == 1) {
									tokensFinally = [];
									current = tokensFinally;
								} else {
									current.push(tokens[i]);
								}
								break;
							case "endtry":
								depth--;
								if(depth > 0)
									current.push(tokens[i]);
								break;
							default:
								current.push(tokens[i]);
						}
					}

					let compiledBody = null;
					let compiledCatch = null;
					let compiledFinally = null;

					if(tokensBody)
						compiledBody = this.createFromForthTokens(tokensBody);

					if(tokensCatch)
						compiledCatch = this.createFromForthTokens(tokensCatch);

					if(tokensFinally)
						compiledFinally = this.createFromForthTokens(tokensFinally);

					add(new AST.TryCatchFinally(compiledBody, catchVar, compiledCatch, compiledFinally));
					break;
				}

				case "begin": {
					while(depth > 0) {
						i++;

						if(i >= tokens.length)
							throw new Error("Couldn't find closing 'again/until' for 'begin'");

						if(tokens[i].type !== AST.Types.Token) {
							current.push(tokens[i]);
							continue;
						}

						switch(tokens[i].value.toLowerCase()) {
							case "begin":
								depth++;
								current.push(tokens[i]);
								break;
							case "until":
							case "again":
								depth--;
								if(depth > 0)
									current.push(tokens[i]);
								break;
							default:
								current.push(tokens[i]);
						}
					}

					let ltoken = tokens[i].value.toLowerCase();
					if(ltoken.toLowerCase() == "until")
						add(new AST.BeginUntil(this.createFromForthTokens(current)));
					else if(ltoken == "again")
						add(new AST.BeginAgain(this.createFromForthTokens(current)));
					else
						throw new Error("Internal compiler error: last closing element in a begin loop was invalid");
					break;
				}

				case "case": {
					// TODO: we have to parse the of entries
					let defaultOf = null;
					while(depth > 0) {
						i++;

						if(i >= tokens.length)
							throw new Error("Couldn't find closing 'endcase' for 'case'");

						if(tokens[i].type !== AST.Types.Token) {
							current.push(tokens[i]);
							continue;
						}

						switch(tokens[i].value.toLowerCase()) {
							case "case":
								depth++;
								current.push(tokens[i]);
								break;
							case "endcase":
								depth--;
								if(depth > 0)
									current.push(tokens[i]);
								break;
							default:
								current.push(tokens[i]);
						}
					}

					// parse of endof

					add(new AST.BranchCase(this.createFromForthTokens(current), defaultOf));
					break;
				}

				case "do":
				case "+do":
				case "-do": {
					let starti = i;
					let start = tokens[i];

					i++;

					if(i >= tokens.length)
							throw new Error("Couldn't find closing element for '" + start.value + "'");

					let idx = tokens[i].value;

					while(depth > 0) {
						i++;

						if(i >= tokens.length)
							throw new Error("Couldn't find closing element for '" + start.value + "'");

						if(tokens[i].type !== AST.Types.Token) {
							current.push(tokens[i]);
							continue;
						}

						switch(tokens[i].value.toLowerCase()) {
							case "do":
							case "+do":
							case "-do":
								depth++;
								current.push(tokens[i]);
								break;
							case "loop":
								depth--;
								if(depth > 0)
									current.push(tokens[i]);
								break;
							default:
								current.push(tokens[i]);
						}
					}

					if(tokens[i].value.toLowerCase() != "loop") {
						throw new Error("Internal compiler error: last closing element in a '" + start + "' loop was invalid");
					}
					switch(start.value.toLowerCase()) {
						case "do":
							add(new AST.DoLoop(idx, this.createFromForthTokens(current), null));
							break;
						case "+do":
							add(new AST.DoLoop(idx, this.createFromForthTokens(current), "<"));
							break;
						case "-do":
							add(new AST.DoLoop(idx, this.createFromForthTokens(current), ">"));
							break;
						default:
							throw new Error("Internal compiler error: start element in a '" + start + "' loop was invalid");
					}
					break;
				}

				case "include": {
					let str = "";
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find requirement argument for 'include'");

					add(this.createFromForth(this.loadFile(tokens[i].value)));
					break;
				}

				case ":": { // function definition
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing ';' for ':'");

					if(tokens[i].type !== AST.Types.Token)
						throw new Error("Unexpected token type found after :");

					function_name = tokens[i].value;

					while(depth > 0) {
						i++;
						if(tokens[i].type === AST.Types.Token) {
							if(tokens[i].value == ":" || tokens[i].value == ":noname" || tokens[i].value == ":js" || tokens[i].value == ":jsnoname") {
								depth++;
							} else if(tokens[i].value == ";" || tokens[i].value == "return;") {
								depth--;
							}
						}
						if(depth > 0)
							current.push(tokens[i]);

						if(i >= tokens.length)
							throw new Error("Couldn't find closing ';' for ':'");
					}

					add(new AST.FunctionForth(function_name, this.createFromForthTokens(current)));
					break;
				}

				case ":noname": { // function definition
					while(depth > 0) {
						i++;
						if(tokens[i].type === AST.Types.Token) {
							if(tokens[i].value == ":" || tokens[i].value == ":noname" || tokens[i].value == ":js" || tokens[i].value == ":jsnoname") {
								depth++;
							} else if(tokens[i].value == ";" || tokens[i].value == "return;") {
								depth--;
							}
						}
						if(depth > 0)
							current.push(tokens[i]);

						if(i >= tokens.length)
							throw new Error("Couldn't find closing ';' for ':noname'");
					}

					add(new AST.FunctionForthAnonymous(this.createFromForthTokens(current)));
					break;
				}

				case ":js": { // function definition
					i++;
					if(i >= tokens.length)
						throw new Error("Couldn't find closing ';/return;' for ':js'");

					if(tokens[i].type !== AST.Types.Token)
						throw new Error("Unexpected token type found after :js");

					function_name = tokens[i].value;

					while(depth > 0) {
						i++;
						if(tokens[i].type === AST.Types.Token) {
							if(tokens[i].value == ":" || tokens[i].value == ":noname" || tokens[i].value == ":js" || tokens[i].value == ":jsnoname") {
								depth++;
							} else if(tokens[i].value == ";" || tokens[i].value == "return;") {
								depth--;
							}
						}
						if(depth > 0)
							current.push(tokens[i]);

						if(i >= tokens.length)
							throw new Error("Couldn't find closing ';/return;' for ':js'");
					}

					localtree = this.createFromForthTokens(current);

					if(localtree.body.length > 0) {
						values = localtree.body[0];
						if(values.type !== AST.Types.ValueLocal)
							throw new Error(":js requires { <args> -- <comment> } after the function name");

						values.type = AST.Types.CommentParentheses;
						args = values.values.reverse();
					}

					if(tokens[i].value == "return;") {
						localtree.body.push(new AST.JsCode("return stack.pop()"));
					}

					add(new AST.FunctionJs(function_name, args, localtree, returnValue));
					break;
				}

				case ":jsnoname": { // function definition
					while(depth > 0) {
						i++;
						if(tokens[i].type === AST.Types.Token) {
							if(tokens[i].value == ":" || tokens[i].value == ":noname" || tokens[i].value == ":js" || tokens[i].value == ":jsnoname") {
								depth++;
							} else if(tokens[i].value == ";" || tokens[i].value == "return;") {
								depth--;
							}
						}
						if(depth > 0)
							current.push(tokens[i]);

						if(i >= tokens.length)
							throw new Error("Couldn't find closing ';/return;' for ':jsnoname'");
					}

					localtree = this.createFromForthTokens(current);

					if(localtree.body.length > 0) {
						values = localtree.body[0];
						if(values.type != AST.Types.ValueLocal)
							throw new Error(":jsnoname requires { <args> -- <comment> } after :jsnoname");

						values.type = AST.Types.CommentParentheses;
						args = values.values.reverse();
					}

					if(tokens[i].value == "return;") {
						localtree.body.push(new AST.JsCode("return stack.pop()"));
					}

					add(new AST.FunctionJsAnonymous(args, localtree, returnValue));
					break;
				}

				case ":macro": { // macro definition
					i++;

					if(i >= tokens.length)
						throw new Error("Couldn't find closing ';' for ':'");

					if(tokens[i].type !== AST.Types.Token)
						throw new Error("Unexpected token type found after :macro");

					function_name = tokens[i].value;

					while(depth > 0) {
						i++;
						if(tokens[i].type === AST.Types.Token) {
							if(tokens[i].value == ":macro" || tokens[i].value == ":" || tokens[i].value == ":noname" || tokens[i].value == ":js" || tokens[i].value == ":jsnoname") {
								depth++;
							} else if(tokens[i].value == ";" || tokens[i].value == "return;") {
								depth--;
							}
						}
						if(depth > 0)
							current.push(tokens[i]);

						if(i >= tokens.length)
							throw new Error("Couldn't find closing ';' for ':'");
					}

					args = current.splice(0,1)[0];

					if(args.type != AST.Types.ValueLocal)
						throw new Error(t + " " + function_name + " requires { .. } after the macro name");

					if(function_name.indexOf(".") != -1)
						throw new Error("Macro names can not contain .");

					let macro = new AST.Macro(function_name, args.values, current);
					add(macro);

					this.macros[Mangling.mangle(function_name)] = macro;
					break;
				}

				// forbidden tokens
				case ")": // comment end
				case "]:": // execute js code end
				case "]:d": // execute js code end
				case "else":
				case "then":
				case "endif":
				case "endcase":
				case ";":
				case "return;":
				case "}": { // local variable end
					throw new Error("Unexpected token " + JSON.stringify(t) + " found");
					break;
				}

				default: {
					let mangledT = Mangling.mangle(t.value);
					let dmacro = null;
					// TODO: resolve macro
					// first try to find the macro within the current list
					if(this.macros[mangledT]) {
						dmacro = this.macros[mangledT];
					}

					if(dmacro) {
						let gcode = null;
						if(dmacro.args.length === 0) {
							gcode = this.createFromForthTokens(dmacro.body);
							add(gcode);
						} else {
							gcode = cloneObject(dmacro.body);
							for(let k=dmacro.args.length-1;k>=0;--k) {
								i++;
								for(let n=0; n<gcode.length;++n) {
									let entry = gcode[n];
									switch(entry.type) {
										case AST.Types.Token: {
											if(entry.value == dmacro.args[k]) {
												gcode[n].value = tokens[i].value;
											} else if(entry.value == ("#" + dmacro.args[k])) {
												gcode[n] = new AST.String(tokens[i].value);
											}
											break;
										}
										case AST.Types.JsCodeDirect:
										case AST.Types.JsCode:
										case AST.Types.JsCodeWithReturn:
											switch(tokens[i].type) {
												case AST.Types.Token:
													// TODO: mangeling should only be done in the generateJsCode function
													entry.body = entry.body.replaceWholeWord(dmacro.args[k], Mangling.mangle(tokens[i].value)).replaceAll("#" + dmacro.args[k], Mangling.mangle(tokens[i].value));
													break;
												case AST.Types.Number:
													entry.body = entry.body.replaceWholeWord(dmacro.args[k], tokens[i].value);
													break;
												case AST.Types.String:
													entry.body = entry.body.replaceWholeWord(dmacro.args[k], "\"" + tokens[i].value + "\"");
													break;
												default:
												throw new Error("I don't know what I should do with " + JSON.stringify(tokens[i]) + " as a macro argument");
											}
											break;
									}
								}
							}

							let cgcode = this.createFromForthTokens(gcode);
							cgcode.extendedMacro=t.value;
							add(cgcode);
						}
					} else {
						let match = /^(.+)\((\d*)\)$/.exec(t.value);
						if(match === null) {
							let match = /^(.+)\((\d*)\);$/.exec(t.value);
							if(match === null) {
								add(new AST.Call(t.value));
							} else {
								add(new AST.Call(match[1], match[2], true));
							}
						} else {
							add(new AST.Call(match[1], match[2]));
						}
					}
				}
			}
		}

		return out;
	};

	createFromForth(code) {
		return this.createFromForthTokens(this.tokenize(code));
	};

	generateJsCode(code_tree, indent_characters) {
		if(indent_characters === undefined)
			indent_characters = "\t";

		function generateCode(code_tree, level) {

			let out = "";

			let lp =  "";
			for(let i = 0; i < level; i++)
				lp += indent_characters;

			function append(str, add_level) {
				if(add_level === undefined)
					add_level = 0;
				if(str && str !== "")
					out += lp + indent_characters.repeat(add_level) + str + "\n";
			}

			switch(code_tree.type) {
				case AST.Types.Empty: {
					break;
				}
				case AST.Types.BeginAgain: {
					append("do {");
					out += generateCode(code_tree.body, level);
					append("} while(true);");
					break;
				}
				case AST.Types.BeginUntil: {
					append("do {");
					out += generateCode(code_tree.body, level);
					append("} while(!stack.pop());");
					break;
				}
				case AST.Types.BeginWhileRepeat: {
					append("do {");
					out += generateCode(code_tree.condition, level);
					append("if(!stack.pop()) break;");
					out += generateCode(code_tree.body, level);
					append("} while(true);");
					break;
				}
				case AST.Types.BranchCase: {
					append("switch(stack.pop()) {");
					//code_tree.body.forEach(function(entry) {
					//	out += generateCode(entry, level+1);
					//});
					out += generateCode(code_tree.body, level+1);
					if(code_tree.defaultOf) {
						append("default:");
						out += generateCode(code_tree.defaultOf, level);
					}
					append("}");
					break;
				}
				case AST.Types.BranchCaseOf: {
					append("case " + code_tree.condition + ":");
					out += generateCode(code_tree.body, level+1);
					append("break;");
					break;
				}
				case AST.Types.BranchIf: {
					let openingBrackets = 0;
					let identLevel = "";
					append("if(stack.pop()) {");
					out += generateCode(code_tree.if_body, level);
					if(code_tree.else_if_bodies) {
						code_tree.else_if_bodies.forEach(function(entry) {
							append(identLevel + "} else {");
							identLevel += indent_characters;
							out += generateCode(entry.condition, level+openingBrackets);
							append(identLevel + "if(stack.pop()) {");
							out += generateCode(entry.body, level+openingBrackets+1);
							openingBrackets++;
						});
					}
					if(code_tree.else_body) {
						append(identLevel + "} else {");
						out += generateCode(code_tree.else_body, level+openingBrackets);
					}
					for(let j=0;j<openingBrackets+1;++j) {
						append(identLevel + "}");
						identLevel = identLevel.substr(0,identLevel.length-1);
					}
					break;
				}
				case AST.Types.Body: {
					code_tree.body.forEach((entry) => {
						let l = level;
						if(!entry.extendedMacro)
							l++;
						out += generateCode(entry, l);
					});
					break;
				}

				case AST.Types.Call: {
					let name = Mangling.mangle(code_tree.name);
					let splitted = name.split(".");
					let ctxt = splitted.slice(0, splitted.length-1).join(".");
					if(ctxt === "")
						ctxt = "this";
					if(code_tree.argument_count === undefined) {
						append("if(typeof " + name + " == 'function') {");
						append("if(!" + name + ".forth_function) { stack.pushIfNotUndefined(" + name + ".apply(" + ctxt + ", stack.getTopElements(" + name + ".length)));");
						append("} else { " + name + "(stack); }");
						append("} else { stack.push(" + name + ");}");
					} else if(code_tree.drop_result === undefined) {
						if(code_tree.argument_count === "") {
							append("if(!" + name + ".forth_function) { stack.pushIfNotUndefined(" + name + ".apply(" + ctxt + ", stack.getTopElements(" + name + ".length)));");
							append("} else { " + name + "(stack); }");
						} else if(code_tree.argument_count === 0) {
							append("stack.pushIfNotUndefined(" + name + "());");
						} else {
							append("stack.pushIfNotUndefined(" + name + ".apply(" + ctxt + ", stack.getTopElements(" + code_tree.argument_count + ")));");
						}
					} else {
						if(code_tree.argument_count === "") {
							append("if(!" + name + ".forth_function) { " + name + ".apply(" + ctxt + ", stack.getTopElements(" + name + ".length));");
							append("} else { " + name + "(stack); }");
						} else if(code_tree.argument_count === 0) {
							append(name + "();");
						} else {
							append(name + ".apply(" + ctxt + ", stack.getTopElements(" + code_tree.argument_count + "));");
						}
					}

					break;
				}

				// we ignore CommentLines and CommentParentheses
	            case AST.Types.Screen:
				case AST.Types.CommentLine:
				case AST.Types.CommentParentheses: {
					break;
				}

				case AST.Types.DoLoop: {
					let idx = Mangling.mangle(code_tree.index);

					if(code_tree.increment === null) {
						if(code_tree.compareOperation === null) {
							throw new Error("Can not deduce in which direction the loop should go either use +do, -do, or use a constant increment");
						}

						append("let " + idx + "_increment=stack.pop();");
						append("let " + idx + "_end=stack.pop();");

						append("for(let " + idx + "=stack.pop(); " + idx + code_tree.compareOperation + idx + "_end;" + idx + "+= " + idx + "_increment) {");
							out += generateCode(code_tree.body, level);
						append("}");
					} else {
						append("let " + idx + "_end=stack.pop();");

						if(code_tree.increment == 1) {
							append("for(let " + idx + "=stack.pop(); " + idx + "<" + idx + "_end; ++" + idx + ") {");
						} else if(code_tree.increment == -1) {
							append("for(let " + idx + "=stack.pop(); " + idx + ">" + idx + "_end; --" + idx + ") {");
						} else {
							if(code_tree.increment >= 0) {
								append("for(let " + idx + "=stack.pop(); " + idx + "<" + idx + "_end;" + idx + "+= " + code_tree.increment + ") {");
							} else {
								append("for(let " + idx + "=stack.pop(); " + idx + ">" + idx + "_end;" + idx + "+= " + code_tree.increment + ") {");
							}
						}
							out += generateCode(code_tree.body, level);
						append("}");
					}

					break;
				}

				case AST.Types.FunctionForth: {
					let name = Mangling.mangle(code_tree.name);
					if(name.indexOf(".") != -1)
						throw new Error("Function names can not contain .");
					append("function " + name + "(stack) {");
					out += generateCode(code_tree.body, level);
					append("}");
					append(name + ".forth_function=true;\n");
					break;
				}

				case AST.Types.FunctionForthAnonymous: {
					append("stack.push(function(stack) {");
					out += generateCode(code_tree.body, level);
					append("});\n");
					append("stack.top().forth_function=true;");
					break;
				}

				case AST.Types.FunctionJs: {
					let name = Mangling.mangle(code_tree.name);
					if(name.indexOf(".") != -1)
						throw new Error("Function names can not contain .");
					let args = code_tree.args.map(Mangling.mangle).join(", ");
					append("function " + name + "(" + args + ") {");
					append(indent_characters + "var stack = new SForthStack();");
					out += generateCode(code_tree.body, level);
					append("}");
					break;
				}

				case AST.Types.FunctionJsAnonymous: {
					let args = code_tree.args.map(Mangling.mangle).join(", ");
					append("stack.push(function(" + args + ") {");
					append(indent_characters + "var stack = new SForthStack();");
					out += generateCode(code_tree.body, level);
					append("});");
					break;
				}

				case AST.Types.JsCode: {
					let clean = code_tree.body.replaceAll(" ", "").replaceAll("\t", "").replaceAll("\n", "").replaceAll("\r", "");
					if(clean && clean !== "")
						append(code_tree.body + ";");
					break;
				}
				case AST.Types.JsCodeDirect: {
					let clean = code_tree.body.replaceAll(" ", "").replaceAll("\t", "").replaceAll("\n", "").replaceAll("\r", "");
					if(clean && clean !== "")
						append(code_tree.body);
					break;
				}
				case AST.Types.JsCodeWithReturn: {
					append("stack.push(" + code_tree.body + ");");
					break;
				}

				case AST.Types.JsCodeWithReturnToVar:
				case AST.Types.JsCodeWithReturnToVarTemp: {
					append("var " + Mangling.mangle(code_tree.value) + " = " + code_tree.body + ";");
					break;
				}
				case AST.Types.JsCodeWithReturnAssignToVar: {
					append(Mangling.mangle(code_tree.value) + " = " + code_tree.body + ";");
					break;
				}
				case AST.Types.JsCodeWithReturnAddToVar: {
					append(Mangling.mangle(code_tree.value) + " += " + code_tree.body + ";");
					break;
				}

				case AST.Types.Macro: {
					// macros don't result in code
					break;
				}

				case AST.Types.Number: {
					append(`stack.push(${code_tree.value});`);
					break;
				}
				case AST.Types.NumberToVar:
				case AST.Types.NumberToVarTemp: {
					append(`var ${Mangling.mangle(code_tree.name)} = ${code_tree.value};`);
					break;
				}
				case AST.Types.NumberAssignToVar: {
					append(`${Mangling.mangle(code_tree.name)} = ${code_tree.value};`);
					break;
				}
				case AST.Types.NumberAddToVar: {
					append(`${Mangling.mangle(code_tree.name)} += ${code_tree.value};`);
					break;
				}

				case AST.Types.String: {
					let ch = code_tree.interpolate?"`":"\"";
					append(`stack.push(${ch}${code_tree.value}${ch});`);
					break;
				}
				case AST.Types.StringToVar:
				case AST.Types.StringToVarTemp: {
					let ch = code_tree.interpolate?"`":"\"";
					append(`var ${Mangling.mangle(code_tree.name)} = ${ch}${code_tree.value}${ch};`);
					break;
				}
				case AST.Types.StringAssignToVar: {
					let ch = code_tree.interpolate?"`":"\"";
					append(`${Mangling.mangle(code_tree.name)} = ${ch}${code_tree.value}${ch};`);
					break;
				}
				case AST.Types.StringAddToVar: {
					let ch = code_tree.interpolate?"`":"\"";
					append(`${Mangling.mangle(code_tree.name)} += ${ch}${code_tree.value}${ch};`);
					break;
				}

				case AST.Types.TryCatchFinally: {
					append("try {");
						out += generateCode(code_tree.body, level+1);
					append("} catch( " + code_tree.catchVar + ") {");
						out += generateCode(code_tree.catchBody, level+1);
					if(code_tree.finallyBody) {
						append("} finally {");
						out += generateCode(code_tree.finallyBody, level+1);
					}
					append("}");
					break;
				}
				case AST.Types.ValueLocal:
				case AST.Types.ValueLocalTemp: {
					code_tree.values.forEach((entry) => {
						append(`var ${Mangling.mangle(entry)} = stack.pop();`);
					});
					break;
				}
				case AST.Types.ValueToStack: {
					append(`stack.push(${Mangling.mangle(code_tree.name)});`);
					break;
				}
				default: {
					throw new Error("Unknown type=" + code_tree.type + " Unknown " + JSON.stringify(code_tree, null, "\t"));
				}
			}

			return out;
		}

		let generated_code = "\"use strict\";\n" + generateCode(code_tree, -1);

		if(this.runtimeProvided) {
			return generated_code;
		} else {
			this.runtimeProvided = true;
			return "\"use strict\";\n" +
				"String.prototype.replaceAll = function(search, replacement) { return this.split(search).join(replacement); };" +
				SForthStackCode.toString() + ";" +
				`const SForthStack =  SForthStackCode(${this.options.sforthThrowOnUnderflow});` +
				"var stack = stack || new SForthStack();" +
				generated_code;
		}
	};

	optimizeCodeTree(org_code_tree) {
		let code_tree = cloneObject(org_code_tree);

		let modified;

		function visitNodes(func, current, previous) {
			if(current === null || current === undefined) {
			} else if(current instanceof Array) {
				return func(current, previous);
			} else {
				switch(current.type) {
					case AST.Types.Body:
						return visitNodes(func, current.body, previous);
						break;
					case AST.Types.BeginAgain:
					case AST.Types.BeginUntil:
					case AST.Types.BeginWhileRepeat:
					case AST.Types.BranchCaseOf:
					case AST.Types.BranchIfBody:
					case AST.Types.DoLoop:
					case AST.Types.FunctionForth:
					case AST.Types.FunctionForthAnonymous:
					case AST.Types.FunctionJs:
					case AST.Types.FunctionJsAnonymous:
						visitNodes(func, current.body);
						break;
					case AST.Types.BranchCase:
						visitNodes(func, current.body);
						visitNodes(func, current.defaultOf);
						break;
					case AST.Types.BranchIf:
						visitNodes(func, current.if_body);
						visitNodes(func, current.else_if_bodies);
						visitNodes(func, current.else_body);
						break;
					case AST.Types.Empty:
					case AST.Types.Call:
					case AST.Types.CommentLine:
					case AST.Types.CommentParentheses:
					case AST.Types.JsCode:
					case AST.Types.JsCodeDirect:
					case AST.Types.JsCodeWithReturn:
					case AST.Types.JsCodeWithReturnToVar:
					case AST.Types.JsCodeWithReturnToVarTemp:
					case AST.Types.JsCodeWithReturnAssignToVar:
					case AST.Types.JsCodeWithReturnAddToVar:
					case AST.Types.Macro:
					case AST.Types.Number:
					case AST.Types.NumberToVar:
					case AST.Types.NumberToVarTemp:
					case AST.Types.NumberAssignToVar:
					case AST.Types.NumberAddToVar:
	                case AST.Types.Screen:
					case AST.Types.String:
					case AST.Types.StringToVar:
					case AST.Types.StringToVarTemp:
					case AST.Types.StringAssignToVar:
					case AST.Types.StringAddToVar:
					case AST.Types.ValueLocal:
					case AST.Types.ValueLocalTemp:
						break;
					case AST.Types.TryCatchFinally:
						visitNodes(func, current.body);
						visitNodes(func, current.catchBody);
						visitNodes(func, current.finallyBody);
						break;
					default:
						console.log("Unexpected entry found: " + JSON.stringify(current));
				}
			}
		}

		// rewrite do without a compare operation to do with an increment
		function fixIncompleteDoLoops(current, previous) {
			for (let i=0;i<current.length;++i) {
				let val = current[i];
				if(val.type === AST.Types.DoLoop &&
					val.compareOperation === null && val.increment === null &&
					previous !== null && previous !== undefined && previous.type === AST.Types.Number) {
					modified = true;
					val.increment = previous.value;
					previous.type = AST.Types.Empty;
					return;
				}

				if(val.type == AST.Types.CommentLine || val.type == AST.Types.CommentParentheses) {
				} else if(val.type === AST.Types.Body) {
					previous = visitNodes(fixIncompleteDoLoops, val, previous);
				} else {
					visitNodes(fixIncompleteDoLoops, val);
					previous = val;
				}
			}
			return previous;
		}

		// rewrite var <something> = stack.pop() to ValueLocal
		function rewriteStackPop(current, previous) {
			for (let i=0;i<current.length;++i) {
				let val = current[i];
				if(val.type === AST.Types.JsCode) {
					let match = /^[ ]*var[ ]+(.+)[ ]+=[ ]+stack\.pop\([ ]*\)[ ;]*$/.exec(val.body);
					if(match !== null) {
						modified = true;
						val.type = AST.Types.ValueLocal;
						delete val.body;
						val.values = [match[1]];
					}
				}
				visitNodes(rewriteStackPop, val);
			}
		}

		// remove empty code tree entries
		function removeEmptyCodeTreeEntries(current) {
			for (let i=0;i<current.length;++i) {
				let val = current[i];
				if((val.type === AST.Types.ValueLocal && val.values.length === 0) ||
					(val.type === AST.Types.ValueLocalTemp && val.values.length === 0) ||
					(val.type === AST.Types.Body && val.body.length == 0) ||
					(val.type === AST.Types.Empty)
				) {
					current.splice(i, 1);
					modified = true;
				}
				visitNodes(removeEmptyCodeTreeEntries, val);
			}
		}

		function inlineValueLocal(current, previous) {
			for (let i=0;i<current.length;++i) {
				let val = current[i];
				if(previous !== null && previous !== undefined &&
					(
						(val.type === AST.Types.ValueLocal && val.values.length > 0)
					)
				) {
					if(previous.type === AST.Types.Number) {
						previous.type = AST.Types.NumberToVar;
						previous.name = val.values.splice(0, 1)[0];
						modified = true;
						return;
					} else if(previous.type === AST.Types.String) {
						previous.type = AST.Types.StringToVar;
						previous.name = val.values.splice(0, 1)[0];
						modified = true;
						return;
					} else if(previous.type === AST.Types.JsCodeWithReturn) {
						previous.type = AST.Types.JsCodeWithReturnToVar;
						previous.value = val.values.splice(0,1)[0];
						modified = true;
						return;
					}
				}
				if(val.type == AST.Types.CommentLine || val.type == AST.Types.CommentParentheses) {
				} else if(val.type === AST.Types.ValueLocal && val.values.length == 0) {
				} else if(val.type === AST.Types.ValueLocalTemp && val.values.length == 0) {
				} else if(val.type === AST.Types.NumberToVar || val.type === AST.Types.StringToVar ||
					val.type === AST.Types.JsCodeWithReturnToVar ||
					val.type === AST.Types.NumberToVarTemp || val.type === AST.Types.StringToVarTemp ||
					val.type === AST.Types.JsCodeWithReturnToVarTemp
				) {
				} else if(val.type === AST.Types.Body) {
					previous = visitNodes(inlineValueLocal, val, previous);
				} else {
					visitNodes(inlineValueLocal, val);
					previous = val;
				}
			}
			return previous;
		}

		function inlineValueLocalTemp(current, previous) {
			for (let i=0;i<current.length;++i) {
				let val = current[i];
				if(previous !== null && previous !== undefined &&
					(
						(val.type === AST.Types.ValueLocalTemp && val.values.length > 0)
					)
				) {
					if(previous.type === AST.Types.Number) {
						previous.type = AST.Types.NumberToVarTemp;
						previous.name = val.values.splice(0, 1)[0];
						modified = true;
						return;
					} else if(previous.type === AST.Types.String) {
						previous.type = AST.Types.StringToVarTemp;
						previous.name = val.values.splice(0, 1)[0];
						modified = true;
						return;
					} else if(previous.type === AST.Types.JsCodeWithReturn) {
						previous.type = AST.Types.JsCodeWithReturnToVarTemp;
						previous.value = val.values.splice(0,1)[0];
						modified = true;
						return;
					}
				}
				if(val.type == AST.Types.CommentLine || val.type == AST.Types.CommentParentheses) {
				} else if(val.type === AST.Types.ValueLocal && val.values.length == 0) {
				} else if(val.type === AST.Types.ValueLocalTemp && val.values.length == 0) {
				} else if(val.type === AST.Types.NumberToVar || val.type === AST.Types.StringToVar ||
					val.type === AST.Types.JsCodeWithReturnToVar ||
					val.type === AST.Types.NumberToVarTemp || val.type === AST.Types.StringToVarTemp ||
					val.type === AST.Types.JsCodeWithReturnToVarTemp
				) {
				} else if(val.type === AST.Types.Body) {
					previous = visitNodes(inlineValueLocalTemp, val, previous);
				} else {
					visitNodes(inlineValueLocalTemp, val);
					previous = val;
				}
			}
			return previous;
		}

		function rewriteJSCode(current, previous) {
			for (let i=0;i<current.length;++i) {
				let val = current[i];
				if(val.type === AST.Types.JsCode && previous !== null && previous !== undefined) {
					let match = /^[ ]*(.+)[ ]+=[ ]+stack\.pop\([ ]*\)[ ;]*$/.exec(val.body);
					if(match !== null) {
						if(previous.type === AST.Types.Number) {
							previous.type = AST.Types.NumberAssignToVar;
							previous.name = match[1];
							val.type = AST.Types.Empty;
							modified = true;
							return;
						} else if(previous.type === AST.Types.String) {
							previous.type = AST.Types.StringAssignToVar;
							previous.name = match[1];
							val.type = AST.Types.Empty;
							modified = true;
							return;
						} else if(previous.type === AST.Types.JsCodeWithReturn) {
							previous.type = AST.Types.JsCodeWithReturnAssignToVar;
							previous.value = match[1];
							val.type = AST.Types.Empty;
							modified = true;
							return;
						}
					} else {
						let match = /^[ ]*(.+)[ ]+\+=[ ]+stack\.pop\([ ]*\)[ ;]*$/.exec(val.body);
						if(match !== null) {
							if(previous.type === AST.Types.Number) {
								previous.type = AST.Types.NumberAddToVar;
								previous.name = match[1];
								val.type = AST.Types.Empty;
								modified = true;
								return;
							} else if(previous.type === AST.Types.String) {
								previous.type = AST.Types.StringAddToVar;
								previous.name = match[1];
								val.type = AST.Types.Empty;
								modified = true;
								return;
							} else if(previous.type === AST.Types.JsCodeWithReturn) {
								previous.type = AST.Types.JsCodeWithReturnAddToVar;
								previous.value = match[1];
								val.type = AST.Types.Empty;
								modified = true;
								return;
							}
						} else {
							let match = /^[ ]*return[ ]+stack\.pop\([ ]*\)[ ]*$/.exec(val.body);
							if(match !== null) {
								if(previous.type === AST.Types.Number) {
									previous.type = AST.Types.Empty;
									val.body = "return " + previous.value;
									modified = true;
									return;
								} else if(previous.type === AST.Types.String) {
									previous.type = AST.Types.Empty;
									val.body = "return \"" + previous.value + "\"";
									modified = true;
									return;
								} else if(previous.type === AST.Types.JsCodeWithReturn) {
									previous.type = AST.Types.Empty;
									val.body = "return " + previous.body;
									modified = true;
									return;
								}
							}
						}
					}
				}
				if(val.type == AST.Types.CommentLine || val.type == AST.Types.CommentParentheses) {
				} else if(val.type === AST.Types.ValueLocal && val.values.length == 0) {
				} else if(val.type === AST.Types.ValueLocalTemp && val.values.length == 0) {
				} else if(val.type === AST.Types.Body) {
					previous = visitNodes(rewriteJSCode, val, previous);
				} else {
					visitNodes(rewriteJSCode, val);
					previous = val;
				}
			}
			return previous;
		}

		function inlineValueLocalTempIntoJsOperators(current, previous) {
			for (let i=0;i<current.length;++i) {
				let val = current[i];
				if((val.type === AST.Types.JsCodeWithReturn ||
					val.type === AST.Types.JsCodeWithReturnAddToVar ||
					val.type === AST.Types.JsCodeWithReturnToVar ||
					val.type === AST.Types.JsCodeWithReturnToVarTemp ||
					val.type === AST.Types.JsCodeWithReturnAssignToVar
					) &&
					previous !== null && previous !== undefined) {
					let match = /^[ ]*(.+)[ ]+(.+)[ ]+(.+)[ ]*$/.exec(val.body);
					if(match !== null) {
						let previous_used = false;
						switch(previous.type) {
							case AST.Types.NumberToVarTemp:
								if(match[1] === previous.name) {
									match[1] = previous.value;
									previous_used = true;
								}
								if(match[3] === previous.name) {
									match[3] = previous.value;
									previous_used = true;
								}
								val.body = match[1] + " " + match[2] + " " + match[3];
								break;
							case AST.Types.StringToVarTemp:
								val.body = "";
								if(match[1] === previous.name) {
									val.body += "\"" + previous.value + "\"";
									previous_used = true;
								} else {
									val.body += match[1];
								}

								val.body += " " + match[2] + " ";

								if(match[3] === previous.name) {
									val.body += "\"" + previous.value + "\"";
									previous_used = true;
								} else {
									val.body += match[3];
								}
								break;
							case AST.Types.JsCodeWithReturnToVarTemp:
								if(match[1] === previous.value) {
									match[1] = previous.body;
									previous_used = true;
								}
								if(match[3] === previous.value) {
									match[3] = previous.body;
									previous_used = true;
								}
								val.body = match[1] + " " + match[2] + " " + match[3];
								break;
						}

						if(previous_used) {
							previous.type = AST.Types.Empty
							modified = true;
							return;
						}
					}
				}
				if(val.type == AST.Types.CommentLine || val.type == AST.Types.CommentParentheses) {
				} else if(val.type === AST.Types.ValueLocal && val.values.length == 0) {
				} else if(val.type === AST.Types.ValueLocalTemp && val.values.length == 0) {
				} else if(val.type === AST.Types.Body) {
					previous = visitNodes(inlineValueLocalTempIntoJsOperators, val, previous);
				} else {
					visitNodes(inlineValueLocalTempIntoJsOperators, val);
					previous = val;
				}
			}
			return previous;
		}

		do {
			modified = false;

			visitNodes(fixIncompleteDoLoops, code_tree);
			visitNodes(rewriteStackPop, code_tree);
			//visitNodes(inlineValueLocal, code_tree);
			//visitNodes(inlineValueLocalTemp, code_tree);
			visitNodes(rewriteJSCode, code_tree);
			visitNodes(inlineValueLocalTempIntoJsOperators, code_tree);
			visitNodes(removeEmptyCodeTreeEntries, code_tree);
		} while(modified);

		return code_tree;
	};

	compile(code) {
		let res = {};
		try {
			res.code = code;
			res.tokens = this.tokenize(res.code);
			res.code_tree = this.createFromForthTokens(res.tokens);
			res.optimized_code_tree = this.optimizeCodeTree(res.code_tree);
			res.generated_code = this.generateJsCode(res.optimized_code_tree);
		} catch(err) {
			console.error(res);
			err.res = res;
			throw err;
		}
		return res;
	};

	compileFile(filename) {
		return this.compile(this.loadFile(filename));
	}
};
exports.Compiler = Compiler;

})(typeof module === 'undefined'? this['sforth']={} : module.exports);
