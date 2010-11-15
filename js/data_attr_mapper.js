var DataAttrMapper = {
    apply: function(element, object, prefix) {
        if (prefix == undefined || prefix == null) {
            $(element).dataset(object);
        } else {
            for (var key in object) {
                $(element).dataset(prefix + "-" + key, object[key])
            }
        }
        return $(element);
    },

    load: function(constructor, element, prefix) {
            
    }
}