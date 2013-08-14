\ floating point

function forthfdots()  {                                              // f.s
   f.push(ftos) ;
   for (var i=1 ; i < f.length ; type(f[i++] + " ")) ;
   ftos = f.pop() ;
}
primitive("f.s",forthfdots) ;
describe("--",any) ;




function forthfdrop()      { ftos = f.pop() ; }                        // fdrop
primitive("fdrop",forthfdrop) ;
describe("r --",any) ;



function forthfdup()      { f.push(ftos) ; }                           // fdup
primitive("fdup",forthfdup) ;
describe("r -- r r",any) ;



function forthfswap()     {                                            // fswap
	w = f.pop() ;
	f.push(ftos) ;
	ftos = w ;
}
primitive("fswap",forthfswap) ;
describe("r1 r2 -- r2 r1",any) ;



function forthfover()      {                                           // fover
   f.push(ftos) ;
   ftos = f[f.length-2] ;
}
primitive("fover",forthfover) ;
describe("r1 r2 -- r1 r2 r1",any) ;



function forthffetch()      {                                          // f@
   f.push(ftos) ;
   ftos = (m[tos]) ;
   tos = s[sp--] ;
}
primitive("f@",forthffetch) ;
describe("a -- r",any) ;



function forthfstore()      {                                          // f!
   m[tos] = ftos ;
   ftos = f.pop() ;
   tos = s[sp--] ;
}
primitive("f!",forthfstore) ;
describe("r a --",any) ;






function forthfequ()      {                                            // f=
   s[++sp] = tos ;
   tos =  -(ftos == f.pop()) ;
}
primitive("f=",forthfequ) ;
describe("r1 r2 -- f",any) ;




function forthfnequ()       {                                          // f<>
   s[++sp] = tos ;
   tos =  -(ftos != f.pop()) ;
}
primitive("f<>",forthfnequ) ;
describe("r1 r2 -- f",any) ;



function forthfmore()       {                                          // f>
   s[++sp] = tos ;
   tos =  -(f.pop() > ftos) ;
}
primitive("f>",forthfmore) ;
describe("r1 r2 -- f",any) ;



function forthfless()       {                                         // f<
   s[++sp] = tos ;
   tos =  -(f.pop() < ftos) ;
}
primitive("f<",forthfless) ;
describe("r1 r2 -- f",any) ;



function forthf0equ()       {                                         // f0=
   s[++sp] = tos ;
   tos = -(ftos == 0) ;
   ftos = f.pop() ;
}
primitive("f0=",forthf0equ) ;
describe("r -- f",any) ;



function forthf0nequ()       {                                        // f0<>
   s[++sp] = tos ;
   tos = -(ftos != 0) ;
   ftos = f.pop() ;
}
primitive("f0<>",forthf0nequ) ;
describe("r -- f",any) ;



function forthf0less()       {                                        // f0<
   s[++sp] = tos ;
   tos = -(ftos < 0) ;
   ftos = f.pop() ;
}
primitive("f0<",forthf0less) ;
describe("r -- f",any) ;



function forthf0greater()     {                                       // f0>
   s[++sp] = tos ;
   tos = -(ftos > 0) ;
   ftos = f.pop() ;
}
primitive("f0>",forthf0greater) ;
describe("r -- f",any) ;



function forthfnegate()       {                                       // fnegate
   ftos = -ftos ;
}
primitive("fnegate",forthfnegate) ;
describe("r1 -- r2",any) ;



function forthfabs()               {                                  // fabs
   ftos = Math.abs(ftos) ;
}
primitive("fabs",forthfabs) ;
describe("r1 -- r2",any)



function forthfround()               {                                 // fround
   ftos = Math.round(ftos) ;
}
primitive("fround",forthfround) ;
describe("r1 -- r2",any)





function forthfdepth()               {                                  // fdepth
   s[sp++] = tos ;
   tos = f.length ;
}
primitive("fdepth",forthfdepth) ;
describe(" -- u",any)



function forthdtof()  {                                                 // d>f
   f.push(ftos) ;
   ftos =  tos * 0x100000000 + s[sp--] ;
   tos = s[sp--] ;
}
primitive("d>f",forthdtof) ;
describe("d --",jsf|ans) ;


function forthftod()  {                                                 // f>d
   s[++sp] = tos ;
   tos = ftos ;
   ftos = f.pop() ;
   s[++sp] = tos & 0xffffffff ;
   tos = tos/0x100000000
   if (tos<0) tos+=floorfix ;
   tos = Math.floor(tos) ;
}
primitive("f>d",forthftod) ;
describe("r -- d",jsf|ans) ;



function forthstof()  {                                                 // s>f
   f.push(ftos) ;
   ftos = tos ;
   tos = s[sp--] ;
}
primitive("s>f",forthstof) ;
describe("x --",jsf) ;



function forthfplus()  {                                                // f+
   ftos += f.pop() ;
}
primitive("f+",forthfplus) ;
describe("r1 r2 -- r3",jsf|ans) ;



function forthfminus()  {                                               // f-
   ftos = f.pop()-ftos ;
}
primitive("f-",forthfminus) ;
describe("r1 r2 -- r3",jsf|ans) ;



function forthfmul()  {                                                 // f*
   ftos *= f.pop() ;
}
primitive("f*",forthfmul) ;
describe("r1 r2 -- r3",jsf|ans) ;


function forthfdiv()  {                                                 // f/
   var temp = f.pop() ;
   ftos = temp/ftos ;
}
primitive("f/",forthfdiv) ;
describe("r1 r2 -- r3",jsf|ans) ;



function forthfsin()  {                                                 // fsin
   ftos = Math.sin(ftos) ;
}
primitive("fsin",forthfsin) ;
describe("r1 -- r2",jsf|ans) ;



function forthfcos()  {                                                 // fcos
   ftos = Math.cos(ftos) ;
}
primitive("fcos",forthfcos) ;
describe("r1 -- r2",jsf|ans) ;



function forthftan()  {                                                 // ftan
   ftos = Math.tan(ftos) ;
}
primitive("ftan",forthftan) ;
describe("r1 -- r2",jsf|ans) ;




function forthfasin()  {                                                // fasin
   ftos = Math.asin(ftos) ;
}
primitive("fasin",forthfasin) ;
describe("r1 -- r2",jsf|ans) ;




function forthfatan()  {                                                // fatan
   ftos = Math.atan(ftos) ;
}
primitive("fatan",forthfatan) ;
describe("r1 -- r2",jsf|ans) ;



function forthfatan2()  {                                               // fatan2
   ftos = Math.atan2(f.pop(),ftos) ;
}
primitive("fatan2",forthfatan2) ;
describe("r1 r2 -- r3",jsf|ans) ;




function forthfacos()  {                                                // facos
   ftos = Math.acos(ftos) ;
}
primitive("facos",forthfacos) ;
describe("r1 -- r2",jsf|ans) ;




function forthfpower()  {                                               // f**
   ftos = Math.pow(f.pop(),ftos) ;
}
primitive("f**",forthfpower) ;
describe("r1 r2 -- r3",jsf|ans) ;



function forthfln()  {                                                // fln
   ftos = Math.log(ftos) ;
}
primitive("fln",forthfln) ;
describe("r1 -- r2",jsf|ans) ;




// function forthflog()  {                                                // flog
//   ftos = Math.log(10,ftos) ;
// }
// primitive("flog",forthflog) ;
// describe("r1 -- r2",jsf|ans) ;



// (Math.log) : e based



function forthfalog()  {                                               // falog
   ftos = Math.pow(10,ftos) ;
}
primitive("falog",forthfalog) ;
describe("r1 -- r2",jsf|ans) ;






function forthfsqrt()  {                                               // fsqrt
   ftos = Math.sqrt(ftos) ;
}
primitive("fsqrt",forthfsqrt) ;
describe("r1 -- r2",jsf|ans) ;




function forthfmin()  {                                                 // fmin
   ftos = Math.min(ftos,f.pop()) ;
}
primitive("fmin",forthfmin) ;
describe("r1 r2 -- r3",jsf|ans) ;



function forthfmax()  {                                                 // fmax
   ftos = Math.max(ftos,f.pop()) ;
}
primitive("fmax",forthfmax) ;
describe("r1 r2 -- r3",jsf|ans) ;




function forthfdot()  {                                                 // f.
   type(ftos + " ") ;
   ftos = f.pop() ;
}
primitive("f.",forthfdot) ;
describe("r --",jsf|ans) ;


function forthpi()  {                                                   // pi
   f.push(ftos) ;
   ftos = Math.PI ;
}
primitive("pi",forthpi) ;
describe("-- r",jsf|ans) ;



function forthreciproc()  {                                              // 1/F
   ftos = 1/ftos ;
}
primitive("1/f",forthreciproc) ;
describe("r1 -- r2",jsf|ans) ;




function forthfcomma() { m[dp++] = ftos ; ftos = f.pop() ; }               // f,
var x_fcomma  = primitive("f,",forthfcomma) ;
describe("r --",any) ;


primitive("falign",noop,immediate)                                         // falign
describe("--",ans) ;

primitive("faligned",noop,immediate)                                       // faligned
describe("--",ans) ;
