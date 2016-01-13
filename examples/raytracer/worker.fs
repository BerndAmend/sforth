include forth.fs
include raytracer.fs 

:jsnoname { e }
	e.data.id { id }
	e.data.scene deserialize-scene { scene }
	e.data.width { width }
	e.data.height { height }
	e.data.y_start { y_start }
	e.data.y_end { y_end }
	new RayTracer { rayTracer }

	: paint-line { y data }
		' y null === if
			:[ { id: id, done: true } ]: self.postMessage(1)
			self.close
			exit
		endif
		:[ { id: id, y: y, data: data } ]: self.postMessage(1)
	;

	scene width height y_start y_end ' paint-line rayTracer.render
; to self.onmessage
