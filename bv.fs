 : processImage { image }
	' image.data { dst }

	0 ' dst.length 4 do i
		m+ i 2 { j }
		m@ dst i { r }
		m@ dst j { b }
		m! dst i b
		m! dst j r
	loop
;
