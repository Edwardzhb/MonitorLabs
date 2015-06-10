
var http = require('http'),
	path = require('path'),
    url = require('url');
var dao = require('./app_modules/dao'),
    http_server = require('./app_modules/http_server'),
	RDPFileService = require('./app_modules/createRDPFile');
var rdp = require('node-rdp');
var util = require('util');
var qs = require('querystring');

http.createServer(function(req, res) {
  var uri = url.parse(req.url).pathname;
  var data = "";
  if(req.method == "POST"){
	  req.on('data',function(chunk){
		  data += chunk;
		  console.log("the data is reaching");
	  });
  }
  if(uri === "/MonitorLabs"){
	http_server.responseFile(__dirname,res,"MonitorLabs.zip");
	
  }else if(uri === "/saveLabsInfo"){	  
	  //accept data from vm.
	  req.on('end',function(){
		dao.saveLabsInfo(data);
		res.end("success");		  
	  });
  }else if(uri === "/labsInfo/getDomainName"){
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'application/json');
		console.log("getDomainName is starting");
		dao.getDomainName(res);
  }else if(uri.match("/labsInfo/getVMSByDomainName")){
		console.log("getVMS is starting");
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'application/json');
		res.setHeader("Access-Control-Allow-Methods", "POST");	
		req.on('end',function(){
			dao.getVMSByDomainName(res,data);
		});
  }else if(uri.match("/labsInfo/downloadRDPFile")){
	   var data = qs.parse(url.parse(req.url).query);
	   console.log(data);
	   var fileName = data.fileName;
	   RDPFileService.createRDPFile(fileName);
	   http_server.responseFile(__dirname,res,fileName);
   }else{
		http_server.httpRespond(res,uri);
  }
}).listen(3000);
console.log('Server running at http://127.0.0.1:3000/');