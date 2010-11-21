var DataAttrMapper = {
    map: function(element, object, prefix) {
        var keyPre = (prefix == undefined || prefix == null) ? "" : prefix + "-";
        for (var key in object.constructor.columns) {
            $(element).dataset(keyPre + key, object[key])
        }
        return $(element);
    },

    load: function(constructor, element, prefix) {
        var pattern = new RegExp("^" + prefix + "\-(.*)$");
        var object = new constructor();
        var dataset = $(element).dataset();
        for (var key in dataset) {
            object[pattern.exec(key)[1]] = dataset[key];
        }
        return object;
    }
}