var CONTENT_TYPE = {
  js : 'text/plain',
  html : 'text/html',
  mp3 : 'audio/mpeg'
}

var render = function(file, res){
  var fs = require('fs');
  fs.readFile(file, function (err, data) {
    console.log("rendering " + file);
    if (err) {
      handleError(res, err);
    }else {
      handle(res, file, data)
    }    
  });  
};

var handle = function(res, file, data) {
  var fileSuffix = file.match(/.+\.(\w+)/)[1];
  res.writeHead(200, {'Content-Type': eval("CONTENT_TYPE." + fileSuffix), 'Content-Length' : data.length}); 
  res.end(data);
}

var handleError = function(res, err) {  
  if(err.message.indexOf('No such file or directory') >= 0) {
    res.writeHead(404, {'Content-Type': 'text/plain'}); 
    res.end('No page found!');
  }else {
    res.writeHead(500, {'Content-Type': 'text/plain'}); 
    res.end('Server error!');
  }
  console.log(err.message);
}

var parse = function(url) {
  var pathname = require('url').parse(url).pathname
  return '/' == pathname ? 'home.html' : pathname.match(/\/(.+)/)[1]
}

var startServer = function(hostname, port) {
  var http = require('http');
  http.createServer(function (req, res) {   
    render(parse(req.url), res);
  }).listen(port, hostname);
  console.log('Server running at http://' + hostname + ':' + port + '/');
};

startServer('127.0.0.1', '8124');
