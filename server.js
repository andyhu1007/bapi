var render = function(file, res){
  var fs = require('fs');
  fs.readFile(file, function (err, data) {
    if (err) throw err;
    res.end(data);
  });  
};

var parse = function(url) {
  var pathname = require('url').parse(url).pathname
  return '/' == pathname ? 'home.html' : pathname.match(/\/(.+)/)[1]
}

var startServer = function(hostname, port) {
  var http = require('http');
  http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});    
    render(parse(req.url), res);
  }).listen(port, hostname);
  console.log('Server running at http://' + hostname + ':' + port + '/');
};

startServer('127.0.0.1', '8124');
