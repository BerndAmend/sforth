clearstack

new SForthStack value stack2

2 stack2.push

clearstack

stack2.pop

2 = »pushing and getting an element to/from a new forth stack didn't work« assert

\ Object creation and manipulation
create-empty-object { obj }

42 "prop" obj !
"prop" obj @ 42 = »object property set/get failed« assert

m! obj "prop" 100
m@ obj "prop" 100 = »object property m!/m@ failed« assert

\ Array creation and manipulation
new-empty-array { arr }
123 0 arr !
0 arr @ 123 = »array element set/get failed« assert

5 new-array { arr2 }
arr2.length 5 = »new-array size failed« assert
