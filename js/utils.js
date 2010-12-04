var isBlank = function(object) {
    return ('string' == typeof(object)) ? (noval(object) || '' == $.trim(object)) : noval(object);

    function noval(object) {
        return object == undefined || object == null;
    }
}

var roundNumber = function(num, dec) {
    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
}