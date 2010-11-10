var CONTENT_TYPE = {
    PLAIN : 'text/plain',
    HTML : 'text/html',
    MPEG : 'audio/mpeg'
};

var STATUS_CODE = {
    NOT_FOUND : 404,
    SERVER_ERROR : 500
};

var httpServerUtils = {
    CONTENT_TYPE_MAPPING : {
        js : CONTENT_TYPE.PLAIN,
        html : CONTENT_TYPE.HTML,
        mp3 : CONTENT_TYPE.MPEG
    },

    contentType : function(file) {
        return eval("this.CONTENT_TYPE_MAPPING." + file.match(/.+\.(\w+)/)[1]);
    },

    statusCode : function(err) {
        var fileNotFound = err.message.indexOf('No such file or directory') >= 0;
        return {
            code: fileNotFound ? STATUS_CODE.NOT_FOUND : STATUS_CODE.SERVER_ERROR,
            msg: fileNotFound ? 'No page found!' : 'httpServer error!'
        }
    }

};

var httpServer = function(hostname, port) {
    this.utils = httpServerUtils;
    this.start(hostname, port);
}

httpServer.prototype._response = function(res, file, data) {
    res.writeHead(200, {'Content-Type': this.utils.contentType(file), 'Content-Length' : data.length});
    res.end(data);
}

httpServer.prototype._error = function(res, err) {
    var status = this.utils.statusCode(err);
    res.writeHead(status.code, {'Content-Type': CONTENT_TYPE.PLAIN});
    res.end(status.msg);
    console.log(err);
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
