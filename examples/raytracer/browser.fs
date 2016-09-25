include forth.fs
include raytracer.fs

false { is-currently-rendering }
:js renderToCanvas { }
	is-currently-rendering if
		»Rendering was already started« console-log
		exit
	endif
	true to is-currently-rendering
	:[ document.getElementById('worker-count').value ]: { workerCount }
	:[ document.getElementById('width').value ]: { width }
	:[ document.getElementById('height').value ]: { height }
	"processing-time" document.getElementById(1) { processing-time }

	// disable the render button
	"render-button" document.getElementById(1) { render-button }
	true to render-button.disabled

	"canvas" document.getElementById(1) { canvas }
	"2d" canvas.getContext(1) { ctx }

	width to canvas.width
	height to canvas.height

	"scene-desc" document.getElementById(1) { scene-desc }
	"{" scene-desc.value + "}" + { scene }

	workerCount { active-worker }

	' width 1 ctx.createImageData(2) { line }

	»« to processing-time.value
	time-in-ms { start-time }

	:js worker-onmessage { e }
		e.data.id { id }
		' e.data.done if
			// Worker is done
			' active-worker 1 - to active-worker
			' active-worker 0 = if
				time-in-ms start-time - { required-time }
				required-time » ms« + to processing-time.value
				false to is-currently-rendering

				// enable the render-button
				false to render-button.disabled

				// enable the download-button
				"download-button" document.getElementById(1) { download-button }
				false to download-button.disabled
			endif
			exit
		endif
		e.data.y { y }
		e.data.data { data }
		data line.data.set(1)
		' line 0 y ctx.putImageData(3)
	;

	:js worker-onerror { e }
		»web worker error: « e.message + console-log
	;

	0 ' workerCount 1 do i
		:[ new Worker("worker.fs") ]: { worker }

		' worker-onmessage to worker.onmessage
		' worker-onerror to worker.onerror

		:[ {
			id: i,
			scene: scene,
			width: width,
			height: height,
			y_start: (height/workerCount)*i,
			y_end: (height/workerCount)*(i+1)
		} ]:
		worker.postMessage(1)
	loop
;

:js downloadImage { }
	"canvas" document.getElementById { canvas }
	"2d" canvas.getContext(1) { ctx }
	"image/webp" canvas.toDataURL(1) { image } "image/webp" "image/octet-stream" image.replace 'new_window' window.open
; 
