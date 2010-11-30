var Geo = {
    init : function(mapCanvas, defaultLatlng, errCallback) {
        var self = Geo;
        self.mapCanvas = mapCanvas;
        self.defaultLatlng = defaultLatlng;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                self._init(position);
            });
        } else {
            self.show(mapCanvas, defaultLatlng);
            errCallback('Geo not support!')
        }
    },

    _init : function(position) {
        var self = Geo;
        self.show(self.mapCanvas, self.toGoogleLatlng(position));
    },

    show : function(mapCanvas, latlng) {
        var self = Geo;
        self.geocoder = new google.maps.Geocoder();
        var myOptions = {
            zoom: 10,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        self.map = new google.maps.Map(mapCanvas, myOptions);
    },

    locate : function(locality, callback, errCallback) {
        var self = Geo;
        self.geocoder.geocode({ 'address': locality}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var loc = results[0].geometry.location;
                self._mark(loc, locality);
                callback(loc);
            } else {
                errCallback("Nothing Found: " + status);
            }
        });
    },

    _mark : function(latlng, title) {
        var self = Geo;
        self.map.setCenter(latlng);
        new google.maps.Marker({
            map: self.map,
            position: latlng,
            title: title
        });
    },

    distance: function(latlng1, latlng2) {
        function toRad(deg) {
            return deg * Math.PI / 180;
        }

        var R = 6371; // Radius of the earth in km
        var dLat = toRad(latlng2.lat - latlng1.lat);
        var dLon = toRad(latlng2.lng - latlng1.lng);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(latlng1.lat)) * Math.cos(toRad(latlng2.lat)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    startWatch : function(callback, errCallback) {
        var self = Geo;
        var watchId = navigator.geolocation.watchPosition(function(position) {
            self._mark(self.toGoogleLatlng(position));
            callback({lat: position.coords.latitude, lng: position.coords.longitude});
        }, function(err) {
            errCallback("Can not track your position: " + err.message);
        });

    },

    update : function(callback) {
        navigator.geolocation.getCurrentPosition(function(position) {
            callback({lat: position.coords.latitude, lng: position.coords.longitude})
        });
    },

    toGoogleLatlng : function (position) {
        return new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
    }
}