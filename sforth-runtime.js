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

function forthFunctionCall(stack, func, context) {
	if(func == undefined) {
		throw new Error("Can not call undefined function");
	} else if(func.forth_function) {
		func(stack);
	} else if(func.forth_function_anonymous) {
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
				throw new Error("Can not call undefined function");
				break;
			default:
				stack.push(func);
		}
	}
}

function forthNew(stack, func) {
	if(func.forth_function) {
		stack.push(new func(stack));
	} else {
		stack.push(new func());
	}
}

// create the global stack
var stack = new ForthStack();
