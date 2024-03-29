include forth.fs

: funGraph { ctx axes func color thick }
	0 0 4 axes.x0 axes.y0 axes.scale { xx yy dx x0 y0 scale }

	ctx.canvas.width x0 - dx / Math.round { iMax }
	0 { iMin }

	axes.doNegativeX if
		x0 -1 * dx / Math.round { iMin }
	endif

	ctx.beginPath(0)
	thick to ctx.lineWidth
	color to ctx.strokeStyle

	iMin iMax 1+ 1 do i
		dx i * to xx
		scale xx scale / func * to yy
		i iMin = if
			x0 xx +  y0 yy - ctx.moveTo(2)
		else
			x0 xx +  y0 yy - ctx.lineTo(2)
		endif
	loop
	ctx.stroke(0)
;

: showAxes { ctx axes }
	axes.x0 { x0 }   ctx.canvas.width  { w }
	axes.y0 { y0 }   ctx.canvas.height { h }
	axes.doNegativeX if
		0 { xmin }
	else
		x0 { xmin }
	endif
	ctx.beginPath(0)
	"rgb(128,128,128)" to ctx.strokeStyle
	xmin y0 ctx.moveTo(2)   w y0 ctx.lineTo(2)  // X axis
	x0    0 ctx.moveTo(2)  x0 h  ctx.lineTo(2)  // Y axis
	ctx.stroke(0)
;


: fun1 ( x -- r ) 3 * Math.cos ;

: draw {}
	"canvas" document.getElementById(1) { canvas }

	create-empty-object { axes }

	"2d" canvas.getContext(1) { ctx }
	0.5 canvas.width  * 0.5 + to axes.x0  // x0 pixels from left to x=0
	0.5 canvas.height * 0.5 + to axes.y0 // y0 pixels from top to y=0
	60 to axes.scale                 // 40 pixels from x=0 to x=1
	true to axes.doNegativeX

	ctx axes showAxes
	ctx axes ' Math.sin "rgb(11,153,11)" 1 funGraph
	ctx axes ' fun1 "rgb(66,44,255)" 2 funGraph
;

draw
