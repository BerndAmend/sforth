clearstack

»test string« { str }
str »test string 2« = not »strings don't match« assert
str »test string« = »two identical strings are equal« assert

"Multiline string 1
line 2
line 3" »Multiline string 1\nline 2\nline 3« assert

»Multiline string 2
line 2
line 3« "Multiline string 2\nline 2\nline 3" assert