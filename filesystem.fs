(
The MIT License (MIT)

Copyright (c) 2013 Bernd Amend <bernd.amend+sforth@gmail.com>

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
)

: readFileSync { filename -- content } :[ Filesystem.readFileSync(filename) ]: ;
: writeFileSync { filename data -- } :[ Filesystem.writeFileSync(filename, data) ]:d ;

: readLineWise ( filename ) readFileSync { content } :[ content.toString() ]: { str } " \n " undefined str.split ;

: dir ( folder -- ) Filesystem.readdirSync ;

(


\ Some tests, should be moved into a different file

: convert-fbv-to-fs { input_file output_file columns rows -- }
    input_file readFileSync { input_data } \ read content from file
    :[ content.toString() ]: { content }
    [ content.length ] columns / { lines } \ calculate how many lines have to be read
       " " \ the result string
       lines 0 ?DO i
         i columns * dup columns + { pos_start pos_end }
         [ content.slice(pos_start, post_end) ] " \n " + +
       LOOP

       { result }

       output_file result writeFileSync
;

\ test
" ps35.fbv " " ps35.fs " 84 42 convert-fbv-to-fs
)