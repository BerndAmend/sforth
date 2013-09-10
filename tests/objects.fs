clearStack

new ForthStack value stack2

2 stack2.push drop

clearStack

stack2.pop

2 = " pushing and getting an element to/from a new forth stack didn't work " assert
