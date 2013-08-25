\ This example requires npm install pdfkit

new PDFDocument value doc

:[ doc.text('Hello world!', 100, 100) ]:d

:[ doc.addPage() ]:d

100 20 doc.moveTo drop \ set the current point
200 160 doc.lineTo drop \ draw a line
230 200 250 120 doc.quadraticCurveTo drop \ draw a quadratic curve
290 -40 300 200 400 150 doc.bezierCurveTo drop \ draw a bezier curve
500 90 doc.lineTo drop \ draw another line
:[ doc.stroke() ]:d

:[ doc.write("out.pdf") ]:d
