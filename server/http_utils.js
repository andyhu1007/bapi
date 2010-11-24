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

var HttpUtils = {
    contentType : function(file) {
        var CONTENT_TYPE_MAPPING = {
            js : CONTENT_TYPE.JS,
            html : CONTENT_TYPE.HTML,
            css : CONTENT_TYPE.CSS,
            mp3 : CONTENT_TYPE.MPEG,
            png : CONTENT_TYPE.PNG
        }
        return eval("CONTENT_TYPE_MAPPING." + file.match(/.+\.(\w+)/)[1]);
    },

    statusCode : function(err) {
        var fileNotFound = err.message.indexOf('No such file or directory') >= 0;
        return {
            code: fileNotFound ? STATUS_CODE.NOT_FOUND : STATUS_CODE.SERVER_ERROR,
            msg: fileNotFound ? 'No page found!' : 'httpServer error!'
        }
    },

    path : function(url) {
        var self = HttpUtils;
        var pathname = self._url.parse(url).pathname;
        var filePath = '/' == pathname ? self.homepage : pathname.match(/\/(.+)/)[1];
        return self.homepath + filePath;
    },

    accept : function(options) {
        var self = HttpUtils;
        var isBlank = function(object) {
            return (object == undefined || object == null);
        }
        self.homepath = !isBlank(options) && !isBlank(options.homepath) ? options.homepath : './';
        self.homepage = !isBlank(options) && !isBlank(options.homepage) ? options.homepage : 'index.html';
    },

    _url : require('url')

};


exports.CONTENT_TYPE = CONTENT_TYPE;
exports.STATUS_CODE = STATUS_CODE;
exports.contentType = HttpUtils.contentType;
exports.statusCode = HttpUtils.statusCode;
exports.path = HttpUtils.path;
exports.accept = HttpUtils.accept;