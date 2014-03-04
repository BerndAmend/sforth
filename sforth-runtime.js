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

function ForthStack() {
	this.stac=new Array();

	this.pop=function() {
		if(this.isEmpty())
			throw new Error("Stack underflow");
		return this.stac.pop();
	}

	this.size=function() {
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

function forthFunctionCall(stack, func, context, name) {
	if(func == undefined) {
		throw new Error("Can not call undefined function (func = undefined name=" + name + ")");
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

// TODO: move into a macro
function forthNew(stack, func) {
	if(func.forth_function) {
		stack.push(new func(stack));
	} else {
		stack.push(new func());
	}
}

function forthDefineMacro(name, args, code, context) {
	if(!context)
		context = this;
	if(!this.forth_macros)
		this.forth_macros = new Object();
	if(this.forth_macros[name])
		throw new Error("A macro with the name '" + name + "' is already defined");
	this.forth_macros[name] = { args: args, code: code };
}

// create the global stack
var stack = new ForthStack();

