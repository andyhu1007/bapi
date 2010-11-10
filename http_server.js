var httpServer = function(hostname, port) {
    this.start(hostname, port);
}

httpServer.prototype.CONTENT_TYPE = {
    PLAIN : 'text/plain',
    HTML : 'text/html',
    MPEG : 'audio/mpeg'
}

httpServer.prototype.STATUS_CODE = {
    NOT_FOUND : 404,
    httpServer_ERROR : 500
}

httpServer.prototype._contentType = function(file) {
    var CONTENT_TYPES = {
        js : this.CONTENT_TYPE.PLAIN,
        html : this.CONTENT_TYPE.HTML,
        mp3 : this.CONTENT_TYPE.MPEG
    }
    var fileSuffix = file.match(/.+\.(\w+)/)[1];
    return eval("CONTENT_TYPES." + fileSuffix);
}

httpServer.prototype._statusCode = function(err) {
    var fileNotFound = err.message.indexOf('No such file or directory') >= 0;
    return {
        code: fileNotFound ? this.STATUS_CODE.NOT_FOUND : this.STATUS_CODE.httpServer_ERROR,
        msg: fileNotFound ? 'No page found!' : 'httpServer error!'
    }
}

httpServer.prototype._render = function(file, res) {
    var self = this;
    require('fs').readFile(file, function (err, data) {
        console.log("get the request for " + file);
        if (err) {
            self._error(res, err);
        } else {
            self._response(res, file, data)
        }
    });
};

httpServer.prototype._response = function(res, file, data) {
    res.writeHead(200, {'Content-Type': this._contentType(file), 'Content-Length' : data.length});
    res.end(data);
}

httpServer.prototype._error = function(res, err) {
    var status = this._statusCode(err);
    res.writeHead(status.code, {'Content-Type': this.CONTENT_TYPE.PLAIN});
    res.end(status.msg);
    console.log(err);
}

httpServer.prototype._pathToFile = function(url) {
    var pathname = require('url').parse(url).pathname
    return '/' == pathname ? 'home.html' : pathname.match(/\/(.+)/)[1]
}

httpServer.prototype.start = function(hostname, port) {
    var self = this;
    require('http').createServer(function (req, res) {
        self._render(self._pathToFile(req.url), res);
    }).listen(port, hostname);
    console.log('httpServer running at http://' + hostname + ':' + port + '/');
};

new httpServer('127.0.0.1', '8124');
