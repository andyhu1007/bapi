var server = function(hostname, port) {
    this.start(hostname, port);    
}

server.prototype.CONTENT_TYPE = {
    js : 'text/plain',
    html : 'text/html',
    mp3 : 'audio/mpeg'
}

server.prototype.render = function(file, res) {
    var self = this;
    require('fs').readFile(file, function (err, data) {
        console.log("rendering " + file);
        if (err) {
            self.handleError(res, err);
        } else {
            self.handle(res, file, data)
        }
    });
};

server.prototype.handle = function(res, file, data) {
    var fileSuffix = file.match(/.+\.(\w+)/)[1];
    res.writeHead(200, {'Content-Type': eval("this.CONTENT_TYPE." + fileSuffix), 'Content-Length' : data.length});
    res.end(data);
}

server.prototype.handleError = function(res, err) {
    if (err.message.indexOf('No such file or directory') >= 0) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('No page found!');
    } else {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Server error!');
    }
    console.log(err.message);
}

server.prototype.mapToFile = function(url) {
    var pathname = require('url').parse(url).pathname
    return '/' == pathname ? 'home.html' : pathname.match(/\/(.+)/)[1]
}

server.prototype.start = function(hostname, port) {
    var self = this;
    require('http').createServer(function (req, res) {
        self.render(self.mapToFile(req.url), res);
    }).listen(port, hostname);
    console.log('Server running at http://' + hostname + ':' + port + '/');
};

new server('127.0.0.1', '8124');
