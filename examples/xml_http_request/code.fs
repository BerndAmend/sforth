include forth.fs

:js getSync {}
	new XMLHttpRequest { xmlHttp }
	"GET" "testfile.txt" false xmlHttp.open(3);
	xmlHttp.send();
	xmlHttp.responseText log
;

:js getAsync {}
	new XMLHttpRequest { xmlHttp }
	"GET" "testfile.txt" true xmlHttp.open(3);
	:jsnoname {}
		xmlHttp.readyState 4 === if
			xmlHttp.responseText log
		endif
	; to xmlHttp.onreadystatechange
	xmlHttp.send();
;

: log { msg }
	document.createDocumentFragment(0) { fragment }
	msg document.createTextNode(1) fragment.appendChild(1)
	"br" document.createElement(1) fragment.appendChild(1)
	"#log" document.querySelector(1) { node } fragment node.appendChild(1)
;
