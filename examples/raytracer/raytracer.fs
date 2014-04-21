/*
typeof PNG "undefined = if
	»The node.js module pngjs is required, use sudo npm install pngjs to install it« new Error throw
endif
*/

// Color
	: Color { r g b }
		r to this.r
		g to this.g
		b to this.b
	;

	:noname { k }
		m* k this.r
		m* k this.g
		m* k this.b
		new Color
	; to Color.prototype.scale

	:noname { other }
		m+ this.r other.r
		m+ this.g other.g
		m+ this.b other.b
		new Color
	; to Color.prototype.plus

	:noname { other }
		m* this.r other.r
		m* this.g other.g
		m* this.b other.b
		new Color
	; to Color.prototype.times

	:noname { }
		:[ {
			r: Math.floor(Math.min(Math.max(this.r,0),1) * 255),
			g: Math.floor(Math.min(Math.max(this.g,0),1) * 255),
			b: Math.floor(Math.min(Math.max(this.b,0),1) * 255)
		} ]:
	; to Color.prototype.toDrawingColor

	:jsnoname {}
		:[ {r: this.r, g: this.g, b: this.b} ]:
	return; to Color.prototype.toString

\ define some default colors
1.0 1.0 1.0 new Color  to Color.white
0.5 0.5 0.5 new Color  to Color.grey
0.0 0.0 0.0 new Color  to Color.black
1.0 0.0 0.0 new Color  to Color.red
1.0 1.0 0.0 new Color  to Color.yellow
Color.black to Color.background
Color.black to Color.defaultColor


// Vector
	: Vector { x y z }
		x to this.x
		y to this.y
		z to this.z
	;

	:noname { k }
		m* k this.x
		m* k this.y
		m* k this.z
		new Vector
	; to Vector.prototype.times

	:noname { other }
		m- this.x other.x
		m- this.y other.y
		m- this.z other.z
		new Vector
	; to Vector.prototype.minus

	:noname { other }
		m+ this.x other.x
		m+ this.y other.y
		m+ this.z other.z
		new Vector
	; to Vector.prototype.plus

	:noname { other }
		m* this.x other.x { v1 }
		m* this.y other.y { v2 }
		m+ v1 v2 { v3 }
		m* this.z other.z { v4 }
		m+ v3 v4
	; to Vector.prototype.dot

	:noname {}
		this this.dot Math.sqrt
	; to Vector.prototype.mag

	:noname {}
		this.mag { vmag }
		m=== vmag 0 if
			Infinity
		else
			m/ 1.0 vmag
		endif
		this.times
	; to Vector.prototype.norm

	:noname { other }
		m* this.y other.z  m* this.z other.y -
		m* this.z other.x  m* this.x other.z -
		m* this.x other.y  m* this.y other.x -
		new Vector
	; to Vector.prototype.cross

	:jsnoname {} \ :noname doesn't work here, since the function signature doesn't match the expected
		:[ {x: this.x, y: this.y, z: this.z } ]:
	return; to Vector.prototype.toString



: Camera { pos lookAt }
	pos to this.pos
	0.0 -1.0 0.0 new Vector { down }
	pos lookAt.minus { tmp } tmp.norm to this.forward
	down this.forward.cross { tmp } tmp.norm { tmp } 1.5 tmp.times to this.right
	this.right this.forward.cross  { tmp } tmp.norm { tmp } 1.5 tmp.times to this.up
;


// Sphere
	: Sphere { center radius surface }
		center to this.center
		surface to this.surface
		m* radius radius to this.radius2
	;
	:noname { pos }
		this.center pos.minus { tmp } tmp.norm
	; to Sphere.prototype.normal

	:noname { ray }
		ray.start this.center.minus { eo }
		ray.dir eo.dot { v }
		0 { dist }
		m0>= v if
			this.radius2 eo eo.dot v v * - - { disc }
			m0>= disc if
				v disc Math.sqrt - to dist
			endif
		endif
		m=== dist 0 if
			null
		else
			:[ { thing: this, ray: ray, dist: dist } ]:
		endif
	; to Sphere.prototype.intersect

: Plane { norm offset surface }
	surface to this.surface

	:noname { pos }
		norm
	; to this.normal

	:noname { ray }
		ray.dir norm.dot { denom }
		m0> denom if
			null
		else
			ray.start norm.dot offset + denom -1 * / { dist }
			:[ { thing: this, ray: ray, dist: dist } ]:
		endif
	; to this.intersect
;

:[

var Surfaces;

(function (Surfaces) {
    Surfaces.shiny2 = {
        diffuse: function (pos) {
            return Color.red;
        },
        specular: function (pos) {
            return Color.yellow;
        },
        reflect: function (pos) {
            return 0.7;
        },
        roughness: 250
    };

    Surfaces.shiny = {
        diffuse: function (pos) {
            return Color.white;
        },
        specular: function (pos) {
            return Color.grey;
        },
        reflect: function (pos) {
            return 0.7;
        },
        roughness: 250
    };

    Surfaces.checkerboard = {
        diffuse: function (pos) {
            if ((Math.floor(pos.z) + Math.floor(pos.x)) % 2 !== 0) {
                return Color.white;
            } else {
                return Color.black;
            }
        },
        specular: function (pos) {
            return Color.white;
        },
        reflect: function (pos) {
            if ((Math.floor(pos.z) + Math.floor(pos.x)) % 2 !== 0) {
                return 0.1;
            } else {
                return 0.7;
            }
        },
        roughness: 150
    };
})(Surfaces || (Surfaces = {}));

];


: RayTracer { }
	5 to this.maxDepth

    :noname { ray scene }
        Infinity { closest }
        undefined { closestInter }
        :[ for (var i in scene.things) { ]:d
            ray i scene.things @ { tmp }
			tmp.intersect { inter }
            m<> inter null if
				m< inter.dist closest if
					inter to closestInter
					inter.dist to closest
				endif
            endif
        :[ } ]:d
        closestInter
    ; to this.intersections

    :noname { ray scene }
        ray scene this.intersections { isect }
        isect null <> if
            isect.dist
        else
            undefined
        endif
    ; to this.testRay

    :noname { ray scene depth }
        ray scene this.intersections { isect }
        m=== isect undefined if
            Color.background
        else
            isect scene depth this.shade
            dup undefined === if
				:[ console.log(":(:(:(") ];
            endif
        endif
    ; to this.traceRay

    :noname { isect scene depth }
        isect.ray.dir { d }
        isect.dist d.times isect.ray.start.plus { pos }
        pos isect.thing.normal { normal }

		2
		d normal.dot
		normal.times { tmp } tmp.times
		d.minus
        { reflectDir }

        isect.thing pos normal reflectDir scene  this.getNaturalColor
        Color.background.plus
        { naturalColor }

        m>= depth this.maxDepth if
			Color.grey
		else
			isect.thing pos normal reflectDir scene depth  this.getReflectionColor
		endif
        { reflectedColor }

        reflectedColor naturalColor.plus
    ; to this.shade

    :noname { thing pos normal rd scene depth }
		pos thing.surface.reflect
        :[ { start: pos, dir: rd } ]: scene m+ depth 1 this.traceRay { tmp }
        tmp.scale
    ; to this.getReflectionColor

    :noname { thing pos norm rd scene }
        this { _this }
        :jsnoname { col light }
            pos light.pos.minus { ldis }
            ldis.norm { livec }
            :[ { start: pos, dir: livec } ]: scene _this.testRay { neatIsect }

            neatIsect undefined === if
				false
			else
				neatIsect ldis.mag <=
			endif
			{ isInShadow }

            isInShadow if
                col
            else
                livec norm.dot { illum }
                illum 0 > if
					illum light.color.scale
				else
					Color.defaultColor
				endif
                { lcolor }

                rd.norm livec.dot { specular }
                specular 0 > if
					specular thing.surface.roughness Math.pow light.color.scale
				else
					Color.defaultColor
				endif
                { scolor }

				col
				pos thing.surface.diffuse
				lcolor.times
				pos thing.surface.specular
				scolor.times { tmp } tmp.plus { tmp } tmp.plus

            endif
        return; { addLight }
        :[ scene.lights.reduce(addLight, Color.defaultColor) ]:
    ; to this.getNaturalColor

    :noname { scene png }
        :noname { x y camera }
            :noname { x }
                :[ (x - (png.width / 2.0)) / 2.0 / png.width ]:
            ; { recenterX }
            :noname { y }
                :[ -(y - (png.height / 2.0)) / 2.0 / png.height ]:
            ; { recenterY }

			x recenterX camera.right.times { tmp }  y recenterY camera.up.times tmp.plus  { tmp } camera.forward tmp.plus  { tmp } tmp.norm
        ; { getPoint }

        0 png.height 1 do y
            0 png.width 1 do x
                x y scene.camera getPoint { p }
                :[ { start: scene.camera.pos, dir: p } ]: scene 0 this.traceRay { color }
                color.toDrawingColor { c }

                png.width y * x + 2 << { idx }

                c.r idx png.data !
				c.g idx 1 + png.data !
				c.b idx 2 + png.data !
				0xff idx 3 + png.data !
            loop
            »Line « y "\r + + type
        loop
    ; to this.renderToPNG

    :noname { scene ctx }
		' ctx.canvas.width { width }
		' ctx.canvas.height { height }

		:[ ctx.createImageData(width,height) ]: { image }
		' image.data { dst }

        :noname { x y camera }
            :noname { x }
                :[ (x - (width / 2.0)) / 2.0 / width ]:
            ; { recenterX }
            :noname { y }
                :[ -(y - (height / 2.0)) / 2.0 / height ]:
            ; { recenterY }

			x recenterX camera.right.times { tmp }  y recenterY camera.up.times tmp.plus  { tmp } camera.forward tmp.plus  { tmp } tmp.norm
        ; { getPoint }

        0 height 1 do y
            0 width 1 do x
                x y scene.camera getPoint { p }
                :[ { start: scene.camera.pos, dir: p } ]: scene 0 this.traceRay { color }
                color.toDrawingColor { c }

                width y * x + 2 << { idxr }
                m+ idxr 1 { idxg }
                m+ idxr 2 { idxb }
                m+ idxr 3 { idxa }

                m! dst idxr c.r
				m! dst idxg c.g
				m! dst idxb c.b
				m! dst idxa 0xff
            loop
        loop
        ' image 0 0 ctx.putImageData
    ; to this.renderToCanvas
;

: create-light { pos color }
	:[ { pos: pos, color: color } ]:
;

: default-scene {}
	:[ {} ]: { result }

	 0.0 1.0  0.0  new Vector  0.0  Surfaces.checkerboard  new Plane
	 0.0 1.0 -0.25 new Vector  1.0  Surfaces.shiny         new Sphere
	-1.0 0.5  1.5  new Vector  0.5  Surfaces.shiny         new Sphere
	3 create-array to result.things

	-2.0 2.5  0.0 new Vector  0.49 0.07 0.07  new Color  create-light
	 1.5 2.5  1.5 new Vector  0.07 0.07 0.49  new Color  create-light
	 1.5 2.5 -1.5 new Vector  0.07 0.49 0.071 new Color  create-light
	 0.0 3.5  0.0 new Vector  0.21 0.21 0.35  new Color  create-light
	4 create-array to result.lights

	 3.0 2.0 4.0 new Vector
	-1.0 0.5 0.0 new Vector
	new Camera to result.camera

	result
;


: drawToPNG {}
	:[ {
		width: 640,
		height: 640,
		filterType: -1
	} ]: new PNG { png }

	new RayTracer { rayTracer }
    default-scene png  rayTracer.renderToPNG

    :[ png.pack().pipe(Filesystem.createWriteStream('raytracer.png')) ];
;

:js drawToCanvas { ctx }
	new RayTracer { rayTracer }
    default-scene ctx  rayTracer.renderToCanvas
;

/*
time-in-ms
drawToPNG
time-in-ms swap - { x }
» calculation time =  « x + .
*/
