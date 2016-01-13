include forth.fs

:jsnoname { e } 
	»msg from worker, got « e.data + self.postMessage(1)
; to self.onmessage
