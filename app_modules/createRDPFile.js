// create RDP file and response
var fs = require('fs');


exports.createRDPFile = function(fileName){
	var fullComputerName = fileName.substring(0,fileName.lastIndexOf('.'));
	var changeFormatPath = "./resources/default1.txt";
	var filePath = "./resources/" + fileName;
	if(!fs.existsSync(filePath)){
		fs.readFileSync(changeFormatPath,'utf8').toString().split('\n').forEach(
			function(line){
				var str = line.toString();
				if(str.match("full address:s:")){
					str = "full address:s:" + fullComputerName;
				}
				fs.appendFileSync(filePath,str+ "\n",'utf8');
			}
		);
	}
	
}