var
http = require('http'),
path = require('path'),
url = require("url"),
fs = require('fs'),

port = process.argv[2] || 8080,

extensions = {
	".htm" : "text/html",
	".html" : "text/html",
	".css" : "text/css",
	".fs" : "application/sforth",
	".js" : "application/javascript",
	".json" : "application/json",
	".png" : "image/png",
	".gif" : "image/gif",
	".jpg" : "image/jpeg",
	".svg" : "image/svg+xml"
};

function getDirectoryListening(pathname) {
	var html = '<!doctype html>\
			<html> \
			<head> \
			<meta charset="utf-8"> \
			<title>Index of ' + pathname +'</title> \
			</head> \
			<body> \
			<h1>Index of ' + pathname + '</h1>\n';

	function addRow(filename) {
		var fullfilename = path.join(pathname, filename);
		if(fs.statSync(fullfilename).isDirectory()) {
			filename += "/";
		}

		html += '<a href="' + filename + '">' + filename + '</a><br>';
	}

	addRow(".");
	addRow("..");

	var files = fs.readdirSync(pathname);

	files.forEach(addRow);

	html += '</body></html>';

	return html;
}

http.createServer(function(request, response) {

	var uri = url.parse(request.url).pathname
		, filename = path.join(process.cwd(), uri);

	fs.exists(filename, function(exists) {
		if(!exists) {
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 Not Found\n");
			response.end();
			return;
		}

		if (fs.statSync(filename).isDirectory()) {
			if(fs.existsSync(filename + "/index.html")) {
				filename += '/index.html';
			} else {
				// Directory listening
				response.writeHead(200, {"Content-Type": "text/html"});
				response.write(getDirectoryListening(filename));
				response.end();
				return;
			}
		}

		var ext = path.extname(filename);

		fs.readFile(filename, "binary", function(err, file) {
			if(err) {
				response.writeHead(500, {"Content-Type": "text/plain"});
				response.write(err + "\n");
				response.end();
				return;
			}

			var content_type = "text/plain";
			if(extensions[ext])
				content_type = extensions[ext];
			response.writeHead(200, {"Content-Type": content_type});
			response.write(file, "binary");
			response.end();
		});
	});
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");