include forth.fs

"canvas-output1" document.getElementById(1) { canvas }
"2d" canvas.getContext(1) { ctx }

:js processImage { image }
	' image.width to canvas.width
	' image.height to canvas.height

	' image.data { src }

	image ctx.createImageData(1) { output }
	' output.data { dst }

	0 ' image.height 1 do y
		' y ' image.width * { y-pos }
		' y-pos 4 * { y-pos }
		0 ' image.width 1 do x
			' x 4 * { i }
			' i ' y-pos + { i }

			' i 1 + { ig }
			' i 2 + { ib }
			' i 3 + { ia }

			m@ src i { r }
			m@ src ig { g }
			m@ src ib { b }
			m@ src ia { a }
			m! dst i r
			m! dst ig g
			m! dst ib b
			m! dst ia a
		loop
	loop

	' output 0 0 ctx.putImageData(3)
	 /* 20 20 800 400 ctx.rect
	"1 to ctx.lineWidth
	"red to ctx.strokeStyle
	ctx.stroke */
;

// "#camera-image"
null
:[ {
	video: {
		mandatory: {
			minWidth: 1920,
			minHeight: 1080
		}
	}
} ]: new CameraInterface { cameraInterface }

"error" ' console.log cameraInterface.on
"newImage" ' processImage cameraInterface.on

cameraInterface.start 
