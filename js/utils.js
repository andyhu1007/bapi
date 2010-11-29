var isBlank = function(object) {
    return ('string' == typeof(object)) ? (noval(object) || '' == $.trim(object)) : noval(object);

    function noval(object) {
        return object == undefined || object == null;
    }
}