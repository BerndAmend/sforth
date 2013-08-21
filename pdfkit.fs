\ This example requires npm install pdfkit

:[ new PDFDocument ]: value doc

:[ doc.addPage() ]:d

:[ doc.text('Hello world!', 100, 100) ]:d

:[ doc.moveTo(100, 20) ]:d \ set the current point
:[ doc.lineTo(200, 160) ]:d \ draw a line
:[ doc.quadraticCurveTo(230, 200, 250, 120) ]:d \ draw a quadratic curve
:[ doc.bezierCurveTo(290, -40, 300, 200, 400, 150) ]:d \ draw a bezier curve
:[ doc.lineTo(500, 90) ]:d \ draw another line
:[ doc.stroke() ]:d

:[ doc.write("out.pdf") ]:d

(
new PDFDocument { doc }
doc.addPage
" Hello World! " 100 100 doc.text
)