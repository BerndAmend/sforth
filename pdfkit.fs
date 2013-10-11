(
The MIT License (MIT)

Copyright (c) 2013 Bernd Amend <bernd.amend+sforth@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
)
\ This example requires npm install pdfkit
\ http://pdfkit.org/index.html

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
