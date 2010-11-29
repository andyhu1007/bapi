var Geo = {
    initialize : function(latlng, mapCanvas) {
        var self = Geo;
        self.geocoder = new google.maps.Geocoder();
        var geoLatlng = new google.maps.LatLng(latlng.lat, latlng.lng);
        var myOptions = {
            zoom: 8,
            center: geoLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        self.map = new google.maps.Map(mapCanvas, myOptions);
    },

    locate : function(locality, callback, errCallback) {
        var self = Geo;
        self.geocoder.geocode({ 'address': locality}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var loc = results[0].geometry.location;
                self.map.setCenter(loc);
                var marker = new google.maps.Marker({
                    map: self.map,
                    position: loc
                });
                callback(loc);
            } else {
                errCallback("Nothing Found: " + status);
            }
        });
    }
}