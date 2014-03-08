/**
The MIT License (MIT)

Copyright (c) 2013-2014 Bernd Amend <bernd.amend+sforth@gmail.com>

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

// TODO optimize functions
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

// TODO. ugly hack
String.prototype.replaceWholeWord = function(search, replacement, ch) {
    var target = this;
	ch = ch || [" ", "\t", "\n"];
	for(var i=0;i<ch.length;++i)
		for(var j=0;j<ch.length;++j)
			target = target.split(ch[i] + search + ch[j]).join(ch[i] + replacement + ch[j]);

	// handle the case where the search word is at the beginning
	if(target.substr(0, search.length) == search)
		target = replacement + target.substr(search.length);

	// or the end
	if(target.substr(target.length - search.length) == search)
		target = target.substr(0, target.length - search.length) + replacement;

	return target;
};

Number.isNumeric = function( obj ) {
	return !isNaN( parseFloat(obj) ) && isFinite( obj );
}

function forthClone(other) {
	return JSON.parse(JSON.stringify(other));
}

function ForthStack() {
	this.stac=new Array();

	this.pop=function() {
		if(this.isEmpty())
			throw new Error("Stack underflow");
		return this.stac.pop();
	}

	this.push=function(item) {
		this.stac.push(item);
	}

	this.isEmpty=function() {
		return this.stac.length == 0;
	}

	this.size=function() {
		return this.stac.length;
	}

	this.top=function() {
		return this.get(0);
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

	this.toString=function() {
		return this.stac;
	}

	this.toJSON=function() {
		return JSON.stringify(this.stac);
	}

	this.fromJSON=function(str) {
		var l = JSON.parse(str);
		this.clear();
		for(var i=0;i<l.length;++i)
			this.push(l[i]);
	}
}

// We could optimize away many forthFunctionCall calls
// by keeping tracking how to call a function/value/constant
// in practice this is much harder than it looks since
// every variable in javascript that gets a function assigned
// behaves like a function
function forthFunctionCall(stack, func, context, name) {
	if(func == undefined) {
		//if(name == "undefined")
		stack.push(undefined);
		//else
		//throw new Error("Can not call undefined function (func = undefined name=" + name + ")");
	} else if(func.forth_function) {
		if(context) {
			func.apply(context, stack);
		} else {
			func(stack);
		}
	} else if(func.forth_function_anonymous) {
		if(context)
			func.execute.apply(context, stack);
		else
			func.execute(stack);
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
			case 'undefined':
				throw new Error("Can not call undefined function (typeof func = 'undefined' name=" + name + ")");
				break;
			default:
				stack.push(func);
		}
	}
}

function forthNew(stack, func, name) {
	if(func == undefined) {
		throw new Error("Can not create the object (typeof func = 'undefined' name=" + name + ")");
	} else if(func.forth_function) {
		return new func(stack);
	} else if(func.forth_function_anonymous) {
			return new func.execute(stack); // TODO: This breaks the instanceof operator
	} else {
		var type = typeof func;
		switch(type) {
			case 'function':
				var args = new Array;
				for(var i=0;i<func.length; ++i) {
					args.push(stack.pop());
				}
				args.reverse();
				// TODO: fix this ugly hack
				switch(func.length) {
					case 0: return new func();
					case 1: return new func(args[0]);
					case 2: return new func(args[0], args[1]);
					case 3: return new func(args[0], args[1], args[2]);
					case 4: return new func(args[0], args[1], args[2], args[3]);
					case 5: return new func(args[0], args[1], args[2], args[3], args[4]);
					case 6: return new func(args[0], args[1], args[2], args[3], args[4], args[5]);
					case 7: return new func(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
					case 8: return new func(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
					default:
						throw new Error("The forthNew function should be revised, it can not handle ctors with more than 8 arguments");
				}
				break;
			default:
				throw new Error("Can not create the object (typeof func = 'undefined' name=" + name + ")");
				break;
		}
	}
}

// create the global stack
var stack = new ForthStack();
var forth_macros = forth_macros || {};
