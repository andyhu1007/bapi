var Geo = {
    init : function(mapCanvas, defaultLatlng, errCallback) {
        var self = Geo;
        self.mapCanvas = mapCanvas;
        self.defaultLatlng = defaultLatlng;
        self.geocoder = new google.maps.Geocoder();

        if (navigator.geolocation) {
            self.update(function(position) {
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
        if (noDuplicateMarker(self, latlng, title)) {
            self._markers.push(new google.maps.Marker({
                map: self.map,
                position: latlng,
                title: title
            }))
        }

        function noDuplicateMarker(geo, latlng, title) {
            if (isBlank(geo._markers))
                geo._markers = new Array();

            for (var i = 0; i < geo._markers.length; i++) {
                var marker = geo._markers[i];
                if (marker.getTitle() == title && marker.getPosition().lat() == latlng.lat() && marker.getPosition().lng() == latlng.lng())
                    return false;
            }
            return true;
        }
    },

    direction : function(directionsRequest, directionPanel) {
        var self = Geo;
        self.routeService(directionsRequest, function(directionsResult) {
            new google.maps.DirectionsRenderer({map: self.map, panel: directionPanel, directions: directionsResult});
        });
    },

    distance : function(directionsRequest, callback, errCallback) {
        var self = Geo;
        self.routeService(directionsRequest, function(directionsResult) {
            if(directionsResult.routes.length == 0) return;
            var legs = directionsResult.routes[0].legs;
            var result = {km: 0, hr: 0};
            $.each(legs, function() {
                result.km += this.distance.value / 1000;
                result.hr += this.duration.value / 60 / 60;
            });
            callback({km: roundNumber(result.km, 2), hr: roundNumber(result.hr, 2)});
        }, errCallback);
    },

    routeService : function(directionsRequest, callback, errCallback) {
        var self = Geo;
        if(isBlank(self._routeService))
            self._routeService = new google.maps.DirectionsService();   
        self._routeService.route(directionsRequest, function(directionsResult, directionsStatus) {
            if (google.maps.DirectionsStatus.OK == directionsStatus) {
                if (!isBlank(callback)) callback(directionsResult);
            } else {
                if (!isBlank(errCallback)) errCallback("Could not found the direction: " + directionsStatus);
            }
        });
    },

    startWatch : function(callback, errCallback) {
        var self = Geo;
        var watchId = navigator.geolocation.watchPosition(function(position) {
            var latlng = self.toGoogleLatlng(position);
            self._mark(latlng, 'You are here!');
            callback(latlng);
        }, function(err) {
            errCallback("Can not track your position: " + err.message);
        });
    },

    update : function(callback) {
        var hook = isBlank(callback) ? (function() {
        }) : callback;
        navigator.geolocation.getCurrentPosition(hook);
    },

    currentAddress : function(callback) {
        var self = Geo;
        self.update(function(position) {
            self.address(position, callback);
        });
    },

    toGoogleLatlng : function (position) {
        return new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    }
}