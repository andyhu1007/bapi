var DataAttrMapper = {
    map: function(element, object) {
        var presetPre = object.constructor.dataAttrPre;
        var keyPre = isBlank(presetPre) ? "" : presetPre + "-";
        for (var key in object.constructor.columns) {
            $(element).dataset(keyPre + key, object[key])
        }
        return $(element);
    },

    load: function(element, constructor) {
        var presetPre = constructor.dataAttrPre;
        var pattern = new RegExp(isBlank(presetPre) ? "^(.*)$" : "^" + presetPre + "\-(.*)$");
        var object = new constructor();
        var dataset = $(element).dataset();
        for (var key in dataset) {
            object[pattern.exec(key)[1]] = dataset[key];
        }
        return object;
    }
}