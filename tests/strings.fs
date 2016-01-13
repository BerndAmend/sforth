clearstack

"test string" { str1 }
»test string« { str2 }
str1 str2 = "strings are correctly parsed" assert
str1 »test string 2« = not »strings don't match« assert
str2 »test string« = »two identical strings are equal« assert

"Multiline string 1
line 2
line 3" »Multiline string 1\nline 2\nline 3« = »multiline " strings work« assert

»Multiline string 2
line 2
line 3« "Multiline string 2\nline 2\nline 3" = "multiline » strings work" assert
