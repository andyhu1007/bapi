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

    locate : function(locality, callback) {
        var self = Geo;
        self.geocoder.geocode({ 'address': locality}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                self.map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: self.map,
                    position: results[0].geometry.location
                });
                callback();
            } else {
                alert("Could not find the locality: " + status);
            }
        });
    }
}