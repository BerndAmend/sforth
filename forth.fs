
\ Extend the compiler to understand int types and know what a stack.d and Forth.Stack.r is.
![

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

        this.str=function() {return this.stac;}
    }

    function DefaultStacks() {
        this.d = new ForthStack(); // data stack
        this.r = new ForthStack(); // return stack
        this.r = new ForthStack(); // float stack
    }

	// Mapping of forth functions to javascript functions
	// a pure forth function like
	//   : mul2 ( x -- x ) 2 * ;
	// is converted into the following function
	//   function gff_test1(stack) {
	//     if(!stack) stack = new DefaultStacks();
	//     stack.d.push(2);
	//     gff_$times();
	//   }
	//
	// If you want to write the following javascript function in forth
	//  function mul2(num1, num2) {
	//    return num1 * num2;
	//  }
	// you can do that by writing
	//  :ps test2 { num1 num2 }  ; // :ps enforces that there is no stack parameter
	// which results in the following javascript code
	//

]!

\ data stack operations
: dup ( x -- x x ) ![ stack.d.push(stack.d.top()); ]! ;

: ?dup ( x -- 0 | x x ) ![ if(!stack.d.isempty()) forth_dup(); ]! ;

: drop ( x -- ) ![ stack.d.pop(); ]! ;

: swap ( x1 x2 -- x2 x1 ) { x1 x2 } x2 x1 ;

: over ( x1 x2 -- x1 x2 x1 ) { x1 x2 } x1 x2 x1 ;

: rot ( x1 x2 x3 -- x2 x3 x1 ) ![ var x3 = stack.d.pop(); var x2 = stack.d.pop(); var x1 = stack.d.pop();
								stack.d.push(x1); stack.d.push(x3); stack.d.push(x2); ]! ;

: -rot ( x1 x2 x3 -- x3 x1 x2 ) ![ var x3 = stack.d.pop(); var x2 = stack.d.pop(); var x1 = stack.d.pop();
								stack.d.push(x2); stack.d.push(x1); stack.d.push(x3); ]! ;

: tuck ( x1 x2 -- x2 x1 x2 ) ![ var x2 = stack.d.pop(); var x1 = stack.d.pop();
							stack.d.push(x2); stack.d.push(x1); stack.d.push(x2); ]! ;

: nip ( x1 x2 -- x1) ![ var x1 = stack.d.pop(); stack.d.pop(); stack.d.push(x1); ]! ;


: 2dup ( x1 x2 -- x1 x2 x1 x2 ) ![ var x2 = stack.d.pop(); var x1 = stack.d.pop();
								stack.d.push(x1); stack.d.push(x2);
								stack.d.push(x1); stack.d.push(x2);]! ;

: 2drop ( x x -- ) ![ stack.d.pop(); stack.d.pop(); ]! ;

: 2swap ( x1 x2 x3 x4 -- x3 x4 x1 x2 ) ![
			var x4 = stack.d.pop(); var x3 = stack.d.pop(); var x2 = stack.d.pop(); var x1 = stack.d.pop();
			stack.d.push(x3); stack.d.push(x4); stack.d.push(x1); stack.d.push(x2);
			]! ;

: 2over ( x1 x2 x3 x4 -- x1 x2 x3 x4 x1 x2 ) ![
			var x4 = stack.d.pop(); var x3 = stack.d.pop(); var x2 = stack.d.pop(); var x1 = stack.d.pop();
			stack.d.push(x1); stack.d.push(x2); stack.d.push(x3); stack.d.push(x4);
			stack.d.push(x1); stack.d.push(x2);
			]! ;

: depth ( -- n ) ![ stack.d.push(stack.d.size()); ]! ;

: pick ( xu ... x1 x0 u -- xu ... x1 x0 xu ) ![ stack.d.push(stack.d.get(stack.d.pop())); ]! ;

: roll ( xu xu-1 ... x0 u -- xu-1 ... x0 xu) ![ stack.d.push(stack.d.remove(stack.d.pop())); ]! ;


\ return stack operations
: >r ( x -- ) ![ Forth.Stack.r.push(stack.d.pop()); ]! ;
: r> ( -- x) ![ stack.d.push(Forth.Stack.r.pop()); ]! ;
: r@ ( -- x) ![ stack.d.push(Forth.Stack.r.top()); ]! ;
: rdrop ( x -- ) ![ Forth.Stack.r.pop(); ]! ;

: 2>r ( x1 x2 -- ) ![ var x1 = stack.d.pop(); Forth.Stack.r.push(stack.d.pop()); Forth.Stack.r.push(x1); ]! ;
: 2r> ( -- x1 x2) ![ stack.d.push(Forth.Stack.r.pop()); stack.d.push(Forth.Stack.r.pop()); ]! ;
: 2r@ ( -- x1 x2) ![ stack.d.push(Forth.Stack.r.get(1)); stack.d.push(Forth.Stack.r.top()); ]! ;


\ compare operations
: = ( x1 x2 -- f ) ![ stack.d.push(-(stack.d.pop() == stack.d.pop())); ]! ;
: <> ( x1 x2 -- f ) ![ stack.d.push(-(stack.d.pop() != stack.d.pop())); ]! ;
: > ( x1 x2 -- f ) ![ stack.d.push(-(stack.d.pop() < stack.d.pop())); ]! ;
: < ( x1 x2 -- f ) ![ stack.d.push(-(stack.d.pop() > stack.d.pop())); ]! ;
: 0= ( x1 -- f ) ![ stack.d.push(-(stack.d.pop() == 0)); ]! ;
: 0<> ( x1 -- f ) ![ stack.d.push(-(stack.d.pop() != 0)); ]! ;
: 0< ( x1 -- f ) ![ stack.d.push(-(stack.d.pop() < 0)); ]! ;
: 0> ( x1 -- f ) ![ stack.d.push(-(stack.d.pop() > 0)); ]! ;

: u< ( u1 u2 -- f ) ![
		var u2 = stack.d.pop();        var u1 = stack.d.pop();
		if (u1<0)    u1 += 0x100000000 ; if (u2<0)    u2 += 0x100000000 ;
		stack.d.push(-(u1<u2));
	]! ;

: u> ( u1 u2 -- f ) ![
		var u2 = stack.d.pop();        var u1 = stack.d.pop();
		if (u1<0)    u1 += 0x100000000 ; if (u2<0)    u2 += 0x100000000 ;
		stack.d.push(-(u1>u2));
	]! ;

: within ( x1 x2 x3 -- f ) ![
		var x3 = stack.d.pop(); var x2 = stack.d.pop(); var x1 = stack.d.pop();
		if (x1 < x2 && x2 <= x3) return 0; else return -1;
	]! ;

\ math operations
: + (x1 x2 -- x3 ) ![ stack.d.push(stack.d.pop() + stack.d.pop()); ]! ;
: - (x1 x2 -- x3 ) ![ stack.d.push(-stack.d.pop() + stack.d.pop()); ]! ;
: * (x1 x2 -- x3 ) ![ stack.d.push(stack.d.pop() * stack.d.pop()); ]! ;
: / (x1 x2 -- x3 ) ![ var x2 = stack.d.pop(); var x1 = stack.d.pop(); stack.d.push(x1 / x2); ]! ;

: min (x1 x2 -- x3 ) ![ stack.d.push(Math.min(stack.d.pop(), stack.d.pop())); ]! ;
: max (x1 x2 -- x3 ) ![ stack.d.push(Math.max(stack.d.pop(), stack.d.pop())); ]! ;

\ bool operations
: or (x1 x2 -- x3 ) ![ stack.d.push(stack.d.pop() | stack.d.pop()); ]! ;
: and (x1 x2 -- x3 ) ![ stack.d.push(stack.d.pop() & stack.d.pop()); ]! ;
: xor (x1 x2 -- x3 ) ![ stack.d.push(stack.d.pop() ^ stack.d.pop()); ]! ;
: not (x1 -- x2 ) ![ stack.d.push(stack.d.pop() ^ -1); ]! ;
: invert (x1 -- x2 ) not ;
