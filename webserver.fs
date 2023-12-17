(
The MIT License (MIT)

Copyright (c) 2013-2023 Bernd Amend <bernd.amend+sforth@gmail.com>

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

include "forth.fs"
include »console.fs«

"node:fs" import await { fs }
"node:http" import await { http }
"node:path" import await { path }
"node:url" import await { url }

8080 value port

:[ {
	".htm" : {enc: "utf8", mime: "text/html"},
	".html" : {enc: "utf8", mime: "text/html"},
	".css" : {enc: "utf8", mime: "text/css"},
	".fs" : {enc: "utf8", mime: "application/javascript"},
	".js" : {enc: "utf8", mime: "application/javascript"},
	".json" : {enc: "utf8", mime: "application/json"},
	".png" : {enc: "binary", mime: "image/png"},
	".gif" : {enc: "binary", mime: "image/gif"},
	".jpg" : {enc: "binary", mime: "image/jpeg"},
	".svg" : {enc: "binary", mime: "image/svg+xml"},
	".ttf" : {enc: "binary", mime: "image/truetype"},
	".woff" : {enc: "binary", mime: "application/font-woff"}
} ]: let extensions

:js getDirectoryListening { pathname }

»<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Index of «
pathname +
»</title>
</head>
<body>
<h1>Index of « +
pathname +
»</h1>\n« + value html

	:js addRow { filename }
		pathname filename path.join(2) let fullfilename
		:[ fs.statSync(fullfilename).isDirectory() ]: if
			"/" +to filename
		endif

		html »<a href="« + filename + »">« + filename + »</a><br>« + to html
	;

	"." addRow
	".." addRow

	pathname fs.readdirSync(1) let files

	' addRow files.forEach(1);

	html "</body></html>" +
return;

:jsnoname { request response }
 	:[ url.parse(request.url).pathname ]: let uri
    process.cwd() uri path.join(2) let filename

    :js func { exists }

        filename path.extname(1) let ext
        filename path.dirname(1) let dirname

		exists not if
			404 :[ {"Content-Type": "text/plain"} ]: response.writeHead(2);
			"404 Not Found\n" response.write(1);
			response.end(0);
			return
		endif

		:[ fs.statSync(filename).isDirectory() ]: if
			filename "/index.html" + fs.existsSync(1) if
				"/index.html" +to filename
				".html" to ext
			else
				// Directory listening
				200 :[ {"Content-Type": "text/html"} ]: response.writeHead(2);
				filename getDirectoryListening(1) response.write(1);
				response.end(0);
				return
			endif
		endif

		"text/plain" let content_type
		"utf8" let encoding
		:[ extensions[ext] ]: if
			:[ content_type = extensions[ext].mime ];
			:[ encoding = extensions[ext].enc ];
        endif

        filename encoding
        :jsnoname { err file }
			' err if
				500 :[ {"Content-Type": "text/plain"} ]: response.writeHead(2);
				err "\n" + response.write(1);
				response.end(0);
				return
			endif

            ext ".fs" = if
                "Compile " filename + "\n" + .
                try
                    SForthSystem.Compiler.getDefaultOptions() let options
										' loadFile to options.loadFile
                    :[ [".", dirname] ]: to options.includeDirectories
                    :[ new SForthSystem.Compiler(options) ]: let compiler
                    ' sforth.runtime :[ compiler.compile(file, filename, false).generated_code[0].code ]: + let compiled
                    200 :[ {"Content-Type": content_type} ]: response.writeHead(2);
                    compiled encoding response.write(2);
                catch e
                    "\n"  e.stack + "\n" + .
                    500 :[ {"Content-Type": content_type} ]: response.writeHead(2);
                endtry
            else
                200 :[ {"Content-Type": content_type} ]: response.writeHead(2);
                file encoding response.write(2);
            endif

			response.end(0);
		;
		fs.readFile(3);
	;

	filename ' func fs.exists(2);
;
http.createServer(1) let server
port server.listen(1);

"Static file server running at\n  => http://localhost:" port + "/\nCTRL + C to shutdown\n" + .
