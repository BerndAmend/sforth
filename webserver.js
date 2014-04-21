var
http = require('http'),
path = require('path'),
url = require("url"),
fs = require('fs'),

extensions = {
	".htm" : "text/html",
    ".html" : "text/html",
    ".css" : "text/css",
	".fs" : "application/sforth",
    ".js" : "application/javascript",
	".json" : "application/json",
    ".png" : "image/png",
    ".gif" : "image/gif",
    ".jpg" : "image/jpeg"
};

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

		if (fs.statSync(filename).isDirectory())
			filename += '/index.html';

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
}).listen(8080);
