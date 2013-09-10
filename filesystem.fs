
: readFileSync { filename -- content } :[ Filesystem.readFileSync(filename) ]: ;
: writeFileSync { filename data -- } :[ Filesystem.writeFileSync(filename, data) ]:d ;

: readLineWise ( filename ) readFileSync { content } :[ content.toString() ]: { str } " \n " undefined str.split ;

(


\ Some tests, should be moved into a different file

: convert-fbv-to-fs { input_file output_file columns rows -- }
    input_file readFileSync { input_data } \ read content from file
    :[ content.toString() ]: { content }
    [ content.length ] columns / { lines } \ calculate how many lines have to be read
       " " \ the result string
       lines 0 ?DO
         i columns * dup columns + { pos_start pos_end }
         [ content.slice(pos_start, post_end) ] " \n " + +
       LOOP

       { result }

       output_file result writeFileSync
;

\ test
" ps35.fbv " " ps35.fs " 84 42 convert-fbv-to-fs
)