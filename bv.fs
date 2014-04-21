:js processImage { image ctx }
	' image.data { src }

	:[ ctx.createImageData(image) ]: { output }
	' output.data { dst }

	0 ' image.height 1 do y
		m* y image.width { y-pos }
		m* y-pos 4 { y-pos }
		0 ' image.width 1 do x
			m* x 4 { i }
			m+ i y-pos { i }

			m+ i 1 { ig }
			m+ i 2 { ib }
			m+ i 3 { ia }

			m@ src i { r }
			m@ src ig { g }
			m@ src ib { b }
			m@ src ia { a }
			m! dst i b
			m! dst ig g
			m! dst ib r
			m! dst ia a
		loop
	loop

	' output 0 0 ctx.putImageData
	/* 20 20 800 400 ctx.rect
	"1 to ctx.lineWidth
	"red to ctx.strokeStyle
	ctx.stroke */
;
