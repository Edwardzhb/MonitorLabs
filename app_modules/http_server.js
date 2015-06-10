
var path = require('path'),
    fs = require('fs'),
	mime = require('mime');
	
//my http server
var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css",
	"rdp": "application/rdp"
};//'application/x-rdp'

exports.httpRespond = function (res,uri){
	  console.log(uri);
	  var filename = path.join(process.cwd(), unescape(uri));
	  console.log(filename + process.cwd() + unescape(uri));
	  if(uri === "/"){
		filename += "view/index.html";
	  }
	  var stats;
	  try {
		stats = fs.lstatSync(filename); // throws if path doesn't exist
	  } catch (e) {
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.write('404 Not Found\n');
		res.end();
		return;
	  }
	  if (stats.isFile()) {
		// path exists, is a file
		var mimeType = mimeTypes[path.extname(filename).split(".").reverse()[0]];
		res.writeHead(200, {'Content-Type': mimeType} );
		var fileStream = fs.createReadStream(filename);
		fileStream.pipe(res);
	  } else if (stats.isDirectory()) {
		// path exists, is a directory
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write('Index of '+uri+'\n');
		res.write('TODO, show index?\n');
		res.end();
	  } else {
		// Symbolic link, other?
		// TODO: follow symlinks?  security?
		res.writeHead(500, {'Content-Type': 'text/plain'});
		res.write('500 Internal server error\n');
		res.end();
	  }
};

exports.responseFile = function(dirName,res,fileName){
	//console.log(res);
	var file = dirName + '/resources/'+fileName;
	var filename = path.basename(file);
	var mimeType = mime.lookup(file);
	res.setHeader('Content-disposition', 'attachment; filename=' + filename);
	//console.log(file);
	//console.log(filename);
	if(filename.match(".rdp")){
		res.setHeader('Content-type', "application/x-rdp");
	}else{
		res.setHeader('Content-type', mimeType);
	}
	var filestream = fs.createReadStream(file);
	filestream.pipe(res);
};