var DataAttrMapper = {
    map: function(element, record) {
        var presetPre = record.constructor.dataAttrPre;
        var keyPre = isBlank(presetPre) ? "" : presetPre + "-";
        for (var key in record.constructor.columns) {
            $(element).dataset(keyPre + key, record[key])
        }
        return $(element);
    },

    load: function(element, constructor) {
        var presetPre = constructor.dataAttrPre;
        var pattern = new RegExp(isBlank(presetPre) ? "^(.*)$" : "^" + presetPre + "\-(.*)$");
        var record = new constructor();
        var dataset = $(element).dataset();
        for (var key in dataset) {
            var matched = pattern.exec(key);
            if (!isBlank(matched))
                record[matched[1]] = dataset[key];
        }
        return record;
    }
}