var Application = function() {

    function Selector() {
        this.warning = "article#notification .warning";
        this.newStep = "article#main #new";
        this.newStepDesc = this.newStep + " #desc";
        this.newStepLocality = this.newStep + " #locality";
        this.newStepLocalityFinder = this.newStep + " #getGeo";

        this.map = "#map";
        this.mapHeader = this.map + " header";
        this.mapCanvas = this.map + " #map_canvas";

        this.importer = "#importer";
        this.importerHeader = this.importer + " header";
        this.importerBox = this.importer + " #import";

        this.currentAddressBox = "#currentPosition address";

        this.stepsSection = "article#main #footprints";
        this.totalDesc = this.stepsSection + " #totalDesc"
        this.stepTB = this.stepsSection + " table";
        this.stepTRs = this.stepTB + " tr";
        this.withLocalityStepTRs = this.stepTB + " tr[data-step-locality!='']";
        this.undoneTRs = this.stepTB + " tr.new";
        this.stepTDTasks = this.stepTRs + " td.task";
        this.stepTDShowLocality = this.stepTRs + " td.showLocality";
        this.stepTDLocality = this.stepTRs + " td.locality";
        this.stepTDLocalityAddr = this.stepTDLocality + " address";
        this.stepEdis = this.stepTB + " input";
        this.stepRmBts = this.stepsSection + " .remove";

        this.sort = "#sortOptions";
        this.sortOptions = this.sort + " a";
        this.selectedSortOption = this.sort + " a.selected";
    }

    Selector.apply(this);

    function init() {
        function displayWarning(message) {
            $(warning).html(message);
        }

        function toGoogleLatlng(stepEle) {
            return new google.maps.LatLng($(stepEle).dataset('step-lat'), $(stepEle).dataset('step-lng'));
        }

        (function initDB() {
            if (window.openDatabase) {
                Step.createTable();
            } else {
                displayWarning('Web Databases not supported');
                return;
            }
        })();

        (function initUI() {

            (function initCRUD() {
                function reorder() {
                    StepsController.updateOrder($(stepTRs));
                }

                function updateCurrentAddress(callback) {
                    Geo.update(function(position, currentAddress) {
                        $(currentAddressBox).text(currentAddress.short);
                        $(currentAddressBox).dataset('step-lat', position.coords.latitude);
                        $(currentAddressBox).dataset('step-lng', position.coords.longitude);
                        if (!isBlank(callback)) callback(position, currentAddress);
                    });

                }

                function refresh() {
                    function _render(element) {
                        function locality() {
                            var address = element.dataset('step-locality');
                            address = isBlank(address) ? '' : address;
                            return $("<td class='locality'></td>").
                                    append($("<address></address>").append($("<a target='_blank'></a>").text(address)));

                        }

                        return element.addClass(element.dataset('step-state')).
                                append(
                                $("<td class='task'></td>").
                                        append($("<span class='desc'></span>").text(element.dataset('step-desc'))).
                                        append($("<input type='text'/>").val(element.dataset('step-desc')))
                                ).
                                append($("<td class='showLocality'><span>@</span></td>")).
                                append(locality()).
                                append(
                                $("<td class='buttons'></td>").
                                        append("<span class='button remove'>X</span>")
                                );
                    }

                    StepsController.index("<tr></tr>", function(stepEles) {
                        $(stepTB).html("");
                        $(totalDesc).html("");
                        $.each(stepEles, function() {
                            _render(this).appendTo($(stepTB));
                        });
                        updateCurrentAddress(function renderDirections(position, currentAddress) {
                            $(stepTDLocality).each(function() {
                                var target = $(this).parents('tr').dataset('step-locality');
                                $(this).find('a').attr('href', 'http://maps.google.com/maps?q=from:' + currentAddress.long + '+to:' + target);
                            });
                        });
                    });
                }

                (function initCreate() {
                    (function initNew() {
                        function postNew() {
                            if (isBlank($(newStepDesc).val())) {
                                $(newStepDesc).val($(newStepDesc).attr('placeholder'));
                                $(newStepDesc).select();
                                return;
                            }
                            function params() {
                                var paramValues = {desc: $(newStepDesc).val()};
                                var hasAddress = !isBlank($(newStepLocality).val()) && 'Add' == $(newStepLocalityFinder).val();
                                paramValues.locality = hasAddress ? $(newStepLocality).val() : '';
                                paramValues.lat = hasAddress ? $(newStepLocality).dataset('step-lat') : '';
                                paramValues.lng = hasAddress ? $(newStepLocality).dataset('step-lng') : '';
                                return paramValues;
                            }

                            StepsController.create(params(), refresh, displayWarning);
                        }

                        $(newStepDesc).bind('click keydown', function(evt) {
                            if (evt.type == 'click') {
                                $(this).select();
                            } else if (13 == evt.keyCode) postNew();
                        });

                        $(mapHeader).click(function(evt) {
                            $(mapCanvas).slideToggle();
                        });

                        $(newStepLocality).bind('click keydown', function(evt) {
                            if (evt.type == 'click') {
                                $(this).select();
                            }
                            $(mapCanvas).slideDown();
                            $(newStepLocalityFinder).val('Go');
                        });

                        $(newStepLocalityFinder).bind('click', function codeAddress() {
                            if ('Go' == $(newStepLocalityFinder).val()) {
                                $(mapCanvas).slideDown();
                                var locality = $(newStepLocality).val();
                                if (isBlank(locality)) {
                                    $(newStepLocality).focus();
                                } else {
                                    Geo.locate({'address': locality}, function(location) {
                                        $(newStepLocality).dataset('step-lat', location.lat());
                                        $(newStepLocality).dataset('step-lng', location.lng());
                                        $(newStepLocalityFinder).val('Add');
                                    }, function(msg) {
                                        $(newStepLocality).val(msg);
                                        $(newStepLocality).select();
                                    });
                                }
                            } else postNew();
                        });
                    })();

                    (function initImporter() {
                        $(importerHeader).click(function(evt) {
                            $(importerBox).slideToggle('fast');
                        });

                        $(importerBox).bind('dragover dragend', function (evt) {
                            $(this).toggleClass('hover');
                            return false;
                        });

                        document.querySelector(importerBox).ondrop = function(evt) {
                            $(this).removeClass('hover');
                            var file = evt.dataTransfer.files[0],
                                    reader = new FileReader();
                            reader.onload = function (event) {
                                var stepsParams = new Array();
                                $.each(event.target.result.split("\n"), function() {
                                    if (!isBlank(this.toString())) stepsParams.push({desc: this, locality: '', lat: '', lng: ''});
                                });
                                StepsController.create(stepsParams, refresh, displayWarning);
                            };
                            reader.readAsBinaryString(file);
                            return false;
                        };
                    })();
                })();

                (function initDestroy() {
                    $(stepRmBts).live('click', function(evt) {
                        var self = this;
                        var stepEle = $(self).parents('tr');

                        StepsController.destroy(stepEle, function() {
                            stepEle.remove();
                            reorder();
                            if ('Route' == $(selectedSortOption).text() && !isBlank($(stepEle).dataset('step-locality'))) updateCurrentAddress();
                        }, displayWarning)
                    });
                })();

                (function initUpdate() {
                    $(stepTDTasks).live('click dblclick', function(evt) {
                        var self = this;
                        var stepEle = $(self).parents('tr');
                        if (evt.type == 'click') {
                            StepsController.update(stepEle, {'step-state': $(stepEle).hasClass('done') ? "new" : "done"},
                                    function() {
                                        $(stepEle).toggleClass('new done');
                                    }, displayWarning);
                        }
                        else {
                            $(self).children('.desc').hide();
                            $(self).find("input").show().focus().select();
                        }
                    });

                    $(stepEdis).live('click keydown focusout', function(evt) {
                        if (evt.type == 'click') {
                            return false;
                        } else {
                            if (evt.type == 'keydown' && 13 != evt.keyCode) return;

                            var self = this;
                            var stepEle = $(self).parents('tr');

                            StepsController.update(stepEle, {'step-desc': $(self).val()}, function() {
                                var stepDesc = stepEle.find('.desc');
                                stepDesc.text($(self).val());
                                stepDesc.show();
                                $(self).hide();
                            }, displayWarning);
                        }
                    });

                    $(stepTB).sortable({
                        items: 'tr',
                        update : function() {
                            reorder();
                        }
                    });
                })();

                (function initShow() {
                    $(stepTDShowLocality).live('click', function(evt) {
                        var stepEle = $(this).parents('tr');
                        var locality = stepEle.dataset('step-locality');
                        if (!isBlank(locality)) Geo.locate({'address': locality}, function() {
                        }, displayWarning);
                    });

                    $(currentAddressBox).click(function() {
                        if (!isBlank($(this).text())) Geo.locate({'location': toGoogleLatlng(this), 'address': $(this).text()}, function() {
                        }, displayWarning);
                    });

                    $(sortOptions).bind('click', function(evt) {
                        var selected = 'selected';
                        if (!$(this).hasClass(selected)) {
                            $(this).addClass(selected);
                            $(this).siblings().removeClass(selected);
                            updateCurrentAddress();
                        }
                        return false;
                    });

                })();

                refresh();
            })();

            (function initMap() {
                Geo.init(document.querySelector(mapCanvas), new google.maps.LatLng(39.9042140, 116.4074130), displayWarning);
                Geo.startWatch(reorderSteps, displayWarning);

                function reorderSteps(currentLatlng) {
                    var currentSortOption = $(selectedSortOption).text();
                    if ('Route' == currentSortOption) {
                        var generateGraphDistances = function(vertexes, callback) {
                            var graph = new Graph(vertexes.length);
                            var count = 0;
                            var getDistance = function(graph, vertexes, i, j, callback) {
                                Geo.distance({origin: vertexes[i].latlng, destination: vertexes[j].latlng, travelMode: google.maps.DirectionsTravelMode.DRIVING}, function(result) {
                                    graph.val(i, j, result);
                                    if (i == 0) $(vertexes.stepEle).dataset('distance', result.km);
                                    if (++count == graph.maxArcs()) callback(graph, vertexes);
                                });
                            }

                            for (var i = 0; i < vertexes.length; i++) {
                                for (var j = i; j < vertexes.length; j++) {
                                    if (i == j) graph.val(i, j, {km: 0, hr: 0});
                                    else getDistance(graph, vertexes, i, j, callback);
                                }
                            }
                        }

                        var localityVertexes = function() {
                            var vertexes = new Array();
                            vertexes.push({latlng: currentLatlng});
                            $(withLocalityStepTRs).each(function() {
                                vertexes.push({stepEle: this, latlng: toGoogleLatlng(this)});
                            });
                            return vertexes;
                        }

                        var sortByRoute = function(graph, vertexes) {
                            var sortByNearestNeighbour = function(graph, vertexes) {
                                var start = 0;
                                var routes = new Array();
                                var distance = 0;
                                var time = 0;
                                while (true) {
                                    var min = {km: 99999, hr: 0};
                                    vertexes[start].visited = 1;
                                    var nextStep = start;
                                    for (var i = 0; i < vertexes.length; i++) {
                                        if (!isBlank(vertexes[i].visited)) continue;
                                        if (min.km > graph.val(Math.min(start, i), Math.max(start, i)).km) {
                                            nextStep = i;
                                            min = graph.val(Math.min(start, i), Math.max(start, i));
                                        }
                                    }
                                    if (nextStep == start) break;
                                    distance += min.km;
                                    time += min.hr;
                                    routes.push(vertexes[nextStep].stepEle);
                                    start = nextStep;
                                }
                                return {distance: distance, time: time, routes: routes};
                            }

                            var route = sortByNearestNeighbour(graph, vertexes);
                            for (var k = route.routes.length - 1; k >= 0; k--) {
                                $(route.routes[k]).prependTo($(stepTB));
                            }

                            $(stepTB).sortable({ disabled: true });
                            setTotalDesc(("<span><strong>Distance:</strong>" + roundNumber(route.distance, 2) + "km" + "</span>") + " / " +
                                    ("<span><strong>Time:</strong>" + roundNumber(route.time, 2) + "hr" + "</span>"));
                            highlight();
                        }

                        generateGraphDistances(localityVertexes(), sortByRoute);
                    } else {
                        var generateDistances = function(callback) {
                            var count = 0;
                            var steps = $(withLocalityStepTRs).length;
                            $(withLocalityStepTRs).each(function() {
                                var self = this;
                                Geo.distance({origin: currentLatlng, destination: toGoogleLatlng(self), travelMode: google.maps.DirectionsTravelMode.DRIVING}, function(result) {
                                    $(self).dataset('distance', result.km);
                                    if (++count == steps) callback();
                                });
                            });
                        }

                        var sortByPriority = function() {
                            $(stepTB).sortable({ disabled: false });
                            sortBy('step-seq');
                            setTotalDesc("");
                            highlight();
                        }
                        var sortByDistance = function() {
                            $(stepTB).sortable({ disabled: true });
                            sortBy('distance');
                            setTotalDesc("");
                            highlight();
                        }

                        var sortBy = function(dataAttribute) {
                            var stepLength = $(stepTRs).length;
                            for (var i = 0; i < stepLength; i++) {
                                for (var j = 0; j < stepLength - i - 1; j++) {
                                    var currentStepTR = $(stepTRs)[j];
                                    var nextStepTR = $(stepTRs)[j + 1];
                                    var currentStepVal = $(currentStepTR).dataset(dataAttribute);
                                    var nextStepVal = $(nextStepTR).dataset(dataAttribute);
                                    if (isBlank(nextStepVal)) continue;
                                    if (isBlank(currentStepVal) || parseFloat(currentStepVal) > parseFloat(nextStepVal)) {
                                        $(nextStepTR).insertBefore($(currentStepTR));
                                    }
                                }
                            }
                        }

                        if ('Priority' == currentSortOption) {
                            generateDistances(sortByPriority);
                        } else if ('Distance' == currentSortOption) {
                            generateDistances(sortByDistance);
                        }
                    }


                    function setTotalDesc(desc) {
                        $(totalDesc).html(desc);
                    }

                    function highlight(distance) {
                        $(stepTRs).each(function() {
                            var self = this;
                            var distanceInKm = $(self).dataset('distance');
                            if (!isBlank(distanceInKm) && distanceInKm < 5) {
                                $(self).find('address').addClass('hl');
                            } else {
                                $(self).find('address').removeClass('hl');
                            }
                        });
                    }
                }
            })();
        })();
    }

    return {init: init};
};

$(function() {
    Application().init();
});
