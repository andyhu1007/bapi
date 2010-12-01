var Geo = {
    init : function(mapCanvas, defaultLatlng, errCallback) {
        var self = Geo;
        self.mapCanvas = mapCanvas;
        self.defaultLatlng = defaultLatlng;
        self.geocoder = new google.maps.Geocoder();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                self._init(self.toGoogleLatlng(position));
            });
        } else {
            self._init(defaultLatlng);
            errCallback('Geo not support!')
        }
    },

    _init : function(latlng) {
        var self = Geo;
        var myOptions = {
            zoom: 10,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        self.map = new google.maps.Map(self.mapCanvas, myOptions);
    },

    locate : function(request, callback, errCallback) {
        var self = Geo;
        self.geocoder.geocode(request, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var result = results[0];
                if (!isBlank(request['address'])) {
                    var loc = result.geometry.location;
                    self._mark(loc, request['address']);
                    callback(loc);
                } else if (!isBlank(request['location'])) {
                    callback(result.address_components);
                }
            } else {
                errCallback("Nothing Found: " + status);
            }
        });
    },

    address : function(position, callback) {
        var self = Geo;
        self.locate({'location' : self.toGoogleLatlng(position)}, function(addressComponents) {
            var accepts = ['street_number', 'route', 'sublocality', 'locality', 'country'];
            var addressNames = {long: "", short: ""};
            $.each(addressComponents, function() {
                var self = this;
                isIntersect(accepts, self.types, function() {
                    addressNames.long += " " + self.long_name;
                    addressNames.short += " " + self.short_name;
                });
            });

            callback(addressNames);

            function isIntersect(arrayA, arrayB, callback) {
                $.each(arrayA, function() {
                    var a = this;
                    $.each(arrayB, function() {
                        if (a.toString() == this.toString()) callback();
                    });
                });
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

    direction : function(directionRequest, directionPanel) {
        var self = Geo;
        var service = new google.maps.DirectionsService();
        service.route({origin: directionRequest.origin, destination: directionRequest.destination, travelMode: directionRequest.travelMode}, function(directionsResult, directionsStatus) {
            new google.maps.DirectionsRenderer({map: self.map, panel: directionPanel, directions: directionsResult});
        });
    },

    startWatch : function(callback, errCallback) {
        var self = Geo;
        var watchId = navigator.geolocation.watchPosition(function(position) {
            self._mark(self.toGoogleLatlng(position), 'You are here!');
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

    currentAddress : function(callback) {
        var self = Geo;
        navigator.geolocation.getCurrentPosition(function(position) {
            self.address(position, callback);
        });
    },

    toGoogleLatlng : function (position) {
        return new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    }
}