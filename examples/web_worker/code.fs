include forth.fs

:js sendMessage {}
	"message" document.getElementById(1) { msg }
	msg.value worker.postMessage(1)
;

: log { msg }
	document.createDocumentFragment(0) { fragment }
	msg document.createTextNode(1) fragment.appendChild(1)
	"br" document.createElement(1) fragment.appendChild(1)
	"#log" document.querySelector(1) { node } fragment node.appendChild(1)
;

:[ new Worker("worker.fs") ]: { worker }

:jsnoname { e }
	»Received: « e.data + log
; to worker.onmessage

"Hi" worker.postMessage(1)
