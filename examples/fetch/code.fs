include forth.fs

:async fetchData {}
	"testfile.txt" fetch(1) await { d } d.text(0) await log
;

: log { msg }
	document.createDocumentFragment(0) { fragment }
	msg document.createTextNode(1) fragment.appendChild(1);
	"br" document.createElement(1) fragment.appendChild(1);
	"#log" document.querySelector(1) { node } fragment node.appendChild(1);
;
