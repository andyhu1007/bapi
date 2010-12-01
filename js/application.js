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

        this.stepsSection = "article#main #footprints";
        this.stepTB = this.stepsSection + " table";
        this.stepTRs = this.stepTB + " tr";
        this.undoneTRs = this.stepTB + " tr.new";
        this.stepTDContents = this.stepTRs + " td.content";
        this.stepTDShowLocality = this.stepTRs + " td.showLocality";
        this.stepTDLocality = this.stepTRs + " td.locality";
        this.stepTDLocalityAddr = this.stepTDLocality + " address";
        this.stepEdis = this.stepTB + " input";
        this.stepRmBts = this.stepsSection + " .remove";
    }

    Selector.apply(this);

    function init() {
        function displayWarning(message) {
            $(warning).html(message);
        }

        (function initDB() {
            if (window.openDatabase) {
                Step.createTable();
            } else {
                displayWarning('Web Databases not supported');
            }
        })();

        (function initUI() {
            function hlNearbySteps(currentLatlng) {
                $(undoneTRs).each(function() {
                    if (!isBlank($(this).dataset('step-locality'))) {
                        if (Geo.distance(currentLatlng, toLatlng(this)) < 10) {
                            $(this).find('address').addClass('hl')
                        }
                    } else {
                        $(this).find('address').removeClass('hl');
                    }
                });

                function toLatlng(stepEle) {
                    return {lat: $(stepEle).dataset('step-lat'), lng: $(stepEle).dataset('step-lng')}
                }
            }

            function renderDirections(currentAddress) {
                $(stepTDLocality).each(function(){
                    var target = $(this).parents('tr').dataset('step-locality');
                    $(this).find('a').attr('href', 'http://maps.google.com/maps?q=from:' + currentAddress.long + '+to:' + target);
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
                            $("<td class='content'></td>").
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

                function _list(stepEles, target) {
                    $.each(stepEles, function() {
                        _render(this).appendTo($(target));
                    });
                }

                function _refresh(stepEles) {
                    $(stepTB).html("");
                    _list(stepEles, stepTB);
                }

                StepsController.index("<tr></tr>", function(stepEles) {
                    _refresh(stepEles);
                    Geo.update(hlNearbySteps);
                    Geo.currentAddress(renderDirections);
                });
            }

            function reorder() {
                StepsController.updateOrder($(stepTRs));
            }

            (function initCRUD() {

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
                                var hasAddress = !isBlank($(newStepLocality).val()) && 'Submit' == $(newStepLocalityFinder).val();
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
                                $(mapCanvas).slideDown();
                                $(this).select();
                            } else {
                                if (229 == evt.keyCode) return;
                                if (13 != evt.keyCode) {
                                    $(newStepLocalityFinder).val('Find');
                                }
                                else {
                                    codeAddress();
                                }
                            }
                        });

                        $(newStepLocalityFinder).bind('click', codeAddress);

                        function codeAddress() {
                            if ('Find' == $(newStepLocalityFinder).val()) {
                                $(mapCanvas).slideDown();
                                var locality = $(newStepLocality).val();
                                if (isBlank(locality)) {
                                    $(newStepLocality).focus();
                                } else {
                                    Geo.locate({'address': locality}, function(location) {
                                        $(newStepLocality).dataset('step-lat', location.lat());
                                        $(newStepLocality).dataset('step-lng', location.lng());
                                        $(newStepLocalityFinder).val('Submit');
                                    }, function(msg) {
                                        $(newStepLocality).val(msg);
                                        $(newStepLocality).select();
                                    });
                                }
                            } else postNew();
                        }
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
                        }, displayWarning)
                    });
                })();

                (function initUpdate() {
                    $(stepTDContents).live('click dblclick', function(evt) {
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

                })();
            })();

            refresh();

            (function initMap() {
                Geo.init(document.querySelector(mapCanvas), new google.maps.LatLng(39.9042140, 116.4074130), displayWarning);
                Geo.startWatch(hlNearbySteps, displayWarning);
            })();
        })();
    }

    return {init: init};
};

$(function() {
    Application().init();
});
