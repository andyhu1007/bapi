var HttpServer = function(hostname, port, homePath) {
    this.homePath = homePath;
    this.http = require('http');
    this.fs = require('fs');
    this.utils = require('http_utils.js');
    this.start(hostname, port);
}

HttpServer.prototype.start = function(hostname, port) {
    var self = this;
    self.http.createServer(function (req, res) {
        render(self.utils.path(req.url, self.homePath), res);
    }).listen(port, hostname);
    console.log('httpServer running at http://' + hostname + ':' + port + '/');

    function render(file, res) {
        self.fs.readFile(file, function (err, data) {
            console.log("get the request for " + file);
            if (err) {
                error(res, err);
            } else {
                response(res, file, data)
            }
        });

        function response(res, file, data) {
            res.writeHead(self.utils.STATUS_CODE.OK, {'Content-Type': self.utils.contentType(file), 'Content-Length' : data.length});
            res.end(data);
        }

        function error(res, err) {
            var status = self.utils.statusCode(err);
            res.writeHead(status.code, {'Content-Type': self.utils.CONTENT_TYPE.PLAIN});
            res.end(status.msg);
            console.log(err);
        }
    };
};

exports.listen = function(hostname, port, homePath) {
    new HttpServer(hostname, port, homePath);
}
