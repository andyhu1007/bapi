var CONTENT_TYPE = {
    PLAIN : 'text/plain',
    HTML : 'text/html',
    CSS : 'text/css',
    MPEG : 'audio/mpeg',
    PNG : 'image/png',
    JS : 'application/x-javascript'
};

var STATUS_CODE = {
    OK : 200,
    NOT_FOUND : 404,
    SERVER_ERROR : 500
};

var HttpServerUtils = {
    CONTENT_TYPE_MAPPING : {
        js : CONTENT_TYPE.JS,
        html : CONTENT_TYPE.HTML,
        css : CONTENT_TYPE.CSS,
        mp3 : CONTENT_TYPE.MPEG,
        png : CONTENT_TYPE.PNG
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
    },

    path : function(url) {
        var pathname = require('url').parse(url).pathname
        return '/' == pathname ? 'index.html' : pathname.match(/\/(.+)/)[1]
    }

};

var HttpServer = function(hostname, port) {
    this.utils = HttpServerUtils;
    this.start(hostname, port);
}

HttpServer.prototype.start = function(hostname, port) {
    var self = this;
    require('http').createServer(function (req, res) {
        render(self.utils.path(req.url), res);
    }).listen(port, hostname);
    console.log('httpServer running at http://' + hostname + ':' + port + '/');

    function render(file, res) {
        require('fs').readFile(file, function (err, data) {
            console.log("get the request for " + file);
            if (err) {
                error(res, err);
            } else {
                response(res, file, data)
            }
        });

        function response(res, file, data) {
            res.writeHead(STATUS_CODE.OK, {'Content-Type': self.utils.contentType(file), 'Content-Length' : data.length});
            res.end(data);
        }

        function error(res, err) {
            var status = self.utils.statusCode(err);
            res.writeHead(status.code, {'Content-Type': CONTENT_TYPE.PLAIN});
            res.end(status.msg);
            console.log(err);
        }
    };
};

new HttpServer('127.0.0.1', '8124');
