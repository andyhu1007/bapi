var Geo = {
    init : function(mapCanvas, defaultLatlng, errCallback) {
        var self = Geo;
        self.mapCanvas = mapCanvas;
        self.defaultLatlng = defaultLatlng;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(self._init);
        } else {
            self.show(mapCanvas, defaultLatlng);
            errCallback('Geo not support!')
        }
    },

    _init : function(position) {
        var self = Geo;
        var latlng = {lat: position.coords.latitude, lng: position.coords.longitude};
        self.show(self.mapCanvas, latlng);
    },

    show : function(mapCanvas, latlng) {
        var self = Geo;
        self.geocoder = new google.maps.Geocoder();
        var geoLatlng = new google.maps.LatLng(latlng.lat, latlng.lng);
        var myOptions = {
            zoom: 10,
            center: geoLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        self.map = new google.maps.Map(mapCanvas, myOptions);

        new google.maps.Marker({
            map: self.map,
            position: geoLatlng,
            title: 'You are here!'
        });
    },

    locate : function(locality, callback, errCallback) {
        var self = Geo;
        self.geocoder.geocode({ 'address': locality}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var loc = results[0].geometry.location;
                self.map.setCenter(loc);
                new google.maps.Marker({
                    map: self.map,
                    position: loc,
                    title: locality
                });
                callback(loc);
            } else {
                errCallback("Nothing Found: " + status);
            }
        });
    }
}