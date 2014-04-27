// Color
	@constructor
	: Color { r g b }
		' r to this.r
		' g to this.g
		' b to this.b
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
	@constructor
	: Vector { x y z }
		' x to this.x
		' y to this.y
		' z to this.z
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
		' this this.dot Math.sqrt
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
		m* this.y other.z { x1 } m* this.z other.y { x2 } m- x1 x2
		m* this.z other.x { y1 } m* this.x other.z { y2 } m- y1 y2
		m* this.x other.y { z1 } m* this.y other.x { z2 } m- z1 z2
		new Vector
	; to Vector.prototype.cross

	:jsnoname {} \ :noname doesn't work here, since the function signature doesn't match the expected
		:[ {x: this.x, y: this.y, z: this.z } ]:
	return; to Vector.prototype.toString


@constructor
: Camera { pos lookAt }
	' pos to this.pos
	' lookAt to this.lookAt
	0.0 -1.0 0.0 new Vector { down }
	' pos lookAt.minus { tmp1 } tmp1.norm to this.forward
	' down this.forward.cross { tmp2 } tmp2.norm { tmp3 } 1.5 tmp3.times to this.right
	' this.right this.forward.cross  { tmp4 } tmp4.norm { tmp5 } 1.5 tmp5.times to this.up
;


// Sphere
	@constructor
	: Sphere { center radius surface }
		"Sphere to this.type
		' center to this.center
		' surface to this.surface
		' radius to this.radius
		m* radius radius to this.radius2
	;
	:noname { pos }
		' this.center pos.minus { tmp } tmp.norm
	; to Sphere.prototype.normal

	:noname { ray }
		' ray.start this.center.minus { eo }
		' ray.dir eo.dot { v }
		0 { dist }
		m0>= v if
			' this.radius2 ' eo eo.dot m* v v - - { disc }
			m0>= disc if
				' v ' disc Math.sqrt - to dist
			endif
		endif
		m=== dist 0 if
			null
		else
			:[ { thing: this, ray: ray, dist: dist } ]:
		endif
	; to Sphere.prototype.intersect

// Plane
	@constructor
	: Plane { norm offset surface }
		"Plane to this.type
		' norm to this.norm
		' offset to this.offset
		' surface to this.surface
	;

	:noname { pos }
		this.norm
	; to Plane.prototype.normal

	:noname { ray }
		' ray.dir this.norm.dot { denom }
		m0> denom if
			null
		else
			' ray.start this.norm.dot ' this.offset + denom -1 * / { dist }
			:[ { thing: this, ray: ray, dist: dist } ]:
		endif
	; to Plane.prototype.intersect

:[

var Surfaces;

(function (Surfaces) {
    Surfaces.shiny2 = {
        type: "shiny2",
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
        type: "shiny",
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
        type: "checkerboard",
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

]:d

@constructor
: RayTracer { }
	5 to this.maxDepth

	:noname { ray scene }
		Infinity { closest }
		null { closestInter }
		0 scene.things.length 1 do i
			' ray m@ scene.things i { tmp }
			tmp.intersect { inter }
			m!== inter null if
				m< inter.dist closest if
					' inter to closestInter
					' inter.dist to closest
				endif
			endif
		loop
		' closestInter
	; to this.intersections

	:noname { ray scene }
		' ray ' scene this.intersections { isect }
		m!== isect null if
			isect.dist
		else
			null
		endif
	; to this.testRay

	:noname { ray scene depth }
		' ray ' scene this.intersections { isect }
		m=== isect null if
			' Color.background
		else
			' isect ' scene ' depth this.shade
		endif
	; to this.traceRay

	:noname { isect scene depth }
		isect.ray.dir { d }
		isect.dist d.times isect.ray.start.plus { pos }
		pos isect.thing.normal { normal }

		2
		' d normal.dot
		normal.times { tmp } tmp.times
		d.minus
		{ reflectDir }

		isect.thing pos normal reflectDir scene  this.getNaturalColor
		Color.background.plus
		{ naturalColor }

		m>= depth this.maxDepth if
			' Color.grey
		else
			' isect.thing ' pos ' normal ' reflectDir ' scene ' depth  this.getReflectionColor
		endif
		{ reflectedColor }

		reflectedColor naturalColor.plus
	; to this.shade

	:noname { thing pos normal rd scene depth }
		' pos thing.surface.reflect
		:[ { start: pos, dir: rd } ]: ' scene m+ depth 1 this.traceRay { tmp }
		tmp.scale
	; to this.getReflectionColor

	:noname { thing pos norm rd scene }
		this { _this }
		:jsnoname { col light }
			' pos light.pos.minus { ldis }
			ldis.norm { livec }
			:[ { start: pos, dir: livec } ]: scene _this.testRay { neatIsect }

			m=== neatIsect null if
				false
			else
				' neatIsect ldis.mag <=
			endif
			{ isInShadow }

			isInShadow if
				' col
			else
				livec norm.dot { illum }
				m> illum 0 if
					' illum light.color.scale
				else
					' Color.defaultColor
				endif
				{ lcolor }

				rd.norm livec.dot { specular }
				m> specular 0 if
					' specular thing.surface.roughness Math.pow light.color.scale
				else
					' Color.defaultColor
				endif
				{ scolor }

				' col
				pos thing.surface.diffuse
				lcolor.times
				pos thing.surface.specular
				scolor.times { tmp1 } tmp1.plus { tmp2 } tmp2.plus

			endif
		return; { addLight }
		:[ scene.lights.reduce(addLight, Color.defaultColor) ]:
	; to this.getNaturalColor

	:noname { scene width height y-start y-end line-finish-callback }
		:noname { x y camera }
			:noname { x }
				:[ (x - (width / 2.0)) / 2.0 / width ]:
			; { recenterX }
			:noname { y }
				:[ -(y - (height / 2.0)) / 2.0 / height ]:
			; { recenterY }

			x recenterX camera.right.times { tmp1 }  y recenterY camera.up.times tmp1.plus  { tmp2 } camera.forward tmp2.plus  { tmp3 } tmp3.norm
		; { getPoint }

		:[ new Uint8ClampedArray(width*4) ]: { line }

		y-start y-end 1 do y
			0 width 1 do x
				' x ' y scene.camera getPoint { p }
				:[ { start: scene.camera.pos, dir: p } ]: ' scene ' 0 this.traceRay { color }
				color.toDrawingColor { c }

				x 4 * { idxr }
				m+ idxr 1 { idxg }
				m+ idxr 2 { idxb }
				m+ idxr 3 { idxa }

				m! line idxr c.r
				m! line idxg c.g
				m! line idxb c.b
				m! line idxa 0xff
			loop
			' y ' line line-finish-callback
		loop
		null null line-finish-callback // Done
	; to this.render
;

: create-light { pos color }
	:[ { pos: pos, color: color } ]:
;

: default-scene {}
	create-empty-object { result }

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

: serialize-scene { scene -- str }
	' scene null "t JSON.stringify(3) ;

: deserialize-scene { str -- scene }
	create-empty-object { scene }

	str JSON.parse(1) { desc }

	// things
	' desc.things.length { length }
	length new-array { things }
	0 length 1 do i
		m@ desc.things i { thing }

		thing.type case
			of "Plane
				' thing.norm.x ' thing.norm.y ' thing.norm.z new Vector
				' thing.offset
				m@ Surfaces thing.surface.type
				new Plane
			break
			of "Sphere
				' thing.center.x ' thing.center.y ' thing.center.z new Vector
				' thing.radius
				m@ Surfaces thing.surface.type
				new Sphere
			break
		endcase
		' i things !
	loop
	things to scene.things

	// lights
	desc.lights.length to length
	length new-array { lights }
	0 length 1 do j
		m@ desc.lights j { light }

		' light.pos.x ' light.pos.y ' light.pos.z new Vector
		' light.color.r ' light.color.g ' light.color.b new Color
		create-light
		' j lights !
	loop
	lights to scene.lights

	// camera
	' desc.camera.pos { pos }
	' pos.x ' pos.y ' pos.z new Vector
	' desc.camera.lookAt { lookAt }
	' lookAt.x ' lookAt.y ' lookAt.z new Vector
	new Camera to scene.camera

	scene
;
