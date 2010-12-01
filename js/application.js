var Application = function() {

    function Selector() {
        this.warning = "article#notification .warning";
        this.newTask = "article#main #new";
        this.newTaskDesc = this.newTask + " #desc";
        this.newTaskLocality = this.newTask + " #locality";
        this.newTaskLocalityFinder = this.newTask + " #getGeo";

        this.map = "#map";
        this.mapHeader = this.map + " header";
        this.mapCanvas = this.map + " #map_canvas";

        this.importer = "#importer";
        this.importerHeader = this.importer + " header";
        this.importerBox = this.importer + " #import";

        this.tasksSection = "article#main #footprints";
        this.taskTB = this.tasksSection + " table";
        this.taskTRs = this.taskTB + " tr";
        this.undoneTRs = this.taskTB + " tr.new";
        this.taskTDContents = this.taskTRs + " td.content";
        this.taskTDShowLocality = this.taskTRs + " td.showLocality";
        this.taskTDLocality = this.taskTRs + " td.locality";
        this.taskTDLocalityAddr = this.taskTDLocality + " address";
        this.taskEdis = this.taskTB + " input";
        this.taskRmBts = this.tasksSection + " .remove";
    }

    Selector.apply(this);

    function init() {
        function displayWarning(message) {
            $(warning).html(message);
        }

        (function initDB() {
            if (window.openDatabase) {
                Task.createTable();
            } else {
                displayWarning('Web Databases not supported');
            }
        })();

        (function initUI() {
            function hlNearbyTasks(currentLatlng) {
                $(undoneTRs).each(function() {
                    if (!isBlank($(this).dataset('task-locality'))) {
                        if (Geo.distance(currentLatlng, toLatlng(this)) < 10) {
                            $(this).find('address').addClass('hl')
                        }
                    } else {
                        $(this).find('address').removeClass('hl');
                    }
                });

                function toLatlng(taskEle) {
                    return {lat: $(taskEle).dataset('task-lat'), lng: $(taskEle).dataset('task-lng')}
                }
            }

            function renderDirections(currentAddress) {
                $(taskTDLocality).each(function(){
                    var target = $(this).parents('tr').dataset('task-locality');
                    $(this).find('a').attr('href', 'http://maps.google.com/maps?q=from:' + currentAddress.long + '+to:' + target);
                });
            }

            function refresh() {
                function _render(element) {
                    function locality() {
                        var address = element.dataset('task-locality');
                        address = isBlank(address) ? '' : address;
                        return $("<td class='locality'></td>").
                                append($("<address></address>").append($("<a target='_blank'></a>").text(address)));

                    }

                    return element.addClass(element.dataset('task-state')).
                            append(
                            $("<td class='content'></td>").
                                    append($("<span class='desc'></span>").text(element.dataset('task-desc'))).
                                    append($("<input type='text'/>").val(element.dataset('task-desc')))
                            ).
                            append($("<td class='showLocality'><span>@</span></td>")).
                            append(locality()).
                            append(
                            $("<td class='buttons'></td>").
                                    append("<span class='button remove'>X</span>")
                            );
                }

                function _list(taskEles, target) {
                    $.each(taskEles, function() {
                        _render(this).appendTo($(target));
                    });
                }

                function _refresh(taskEles) {
                    $(taskTB).html("");
                    _list(taskEles, taskTB);
                }

                TasksController.index("<tr></tr>", function(taskEles) {
                    _refresh(taskEles);
                    Geo.update(hlNearbyTasks);
                    Geo.currentAddress(renderDirections);
                });
            }

            function reorder() {
                TasksController.updateOrder($(taskTRs));
            }

            (function initCRUD() {

                (function initCreate() {
                    (function initNew() {
                        function postNew() {
                            if (isBlank($(newTaskDesc).val())) {
                                $(newTaskDesc).val($(newTaskDesc).attr('placeholder'));
                                $(newTaskDesc).select();
                                return;
                            }
                            function params() {
                                var paramValues = {desc: $(newTaskDesc).val()};
                                var hasAddress = !isBlank($(newTaskLocality).val()) && 'Submit' == $(newTaskLocalityFinder).val();
                                paramValues.locality = hasAddress ? $(newTaskLocality).val() : '';
                                paramValues.lat = hasAddress ? $(newTaskLocality).dataset('task-lat') : '';
                                paramValues.lng = hasAddress ? $(newTaskLocality).dataset('task-lng') : '';
                                return paramValues;
                            }

                            TasksController.create(params(), refresh, displayWarning);
                        }

                        $(newTaskDesc).bind('click keydown', function(evt) {
                            if (evt.type == 'click') {
                                $(this).select();
                            } else if (13 == evt.keyCode) postNew();
                        });

                        $(mapHeader).click(function(evt) {
                            $(mapCanvas).slideToggle();
                        });

                        $(newTaskLocality).bind('click keydown', function(evt) {
                            if (evt.type == 'click') {
                                $(mapCanvas).slideDown();
                                $(this).select();
                            } else {
                                if (229 == evt.keyCode) return;
                                if (13 != evt.keyCode) {
                                    $(newTaskLocalityFinder).val('Find');
                                }
                                else {
                                    codeAddress();
                                }
                            }
                        });

                        $(newTaskLocalityFinder).bind('click', codeAddress);

                        function codeAddress() {
                            if ('Find' == $(newTaskLocalityFinder).val()) {
                                $(mapCanvas).slideDown();
                                var locality = $(newTaskLocality).val();
                                if (isBlank(locality)) {
                                    $(newTaskLocality).focus();
                                } else {
                                    Geo.locate({'address': locality}, function(location) {
                                        $(newTaskLocality).dataset('task-lat', location.lat());
                                        $(newTaskLocality).dataset('task-lng', location.lng());
                                        $(newTaskLocalityFinder).val('Submit');
                                    }, function(msg) {
                                        $(newTaskLocality).val(msg);
                                        $(newTaskLocality).select();
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
                                var tasksParams = new Array();
                                $.each(event.target.result.split("\n"), function() {
                                    if (!isBlank(this.toString())) tasksParams.push({desc: this, locality: '', lat: '', lng: ''});
                                });
                                TasksController.create(tasksParams, refresh, displayWarning);
                            };
                            reader.readAsBinaryString(file);
                            return false;
                        };
                    })();
                })();

                (function initDestroy() {
                    $(taskRmBts).live('click', function(evt) {
                        var self = this;
                        var taskEle = $(self).parents('tr');

                        TasksController.destroy(taskEle, function() {
                            taskEle.remove();
                            reorder();
                        }, displayWarning)
                    });
                })();

                (function initUpdate() {
                    $(taskTDContents).live('click dblclick', function(evt) {
                        var self = this;
                        var taskEle = $(self).parents('tr');
                        if (evt.type == 'click') {
                            TasksController.update(taskEle, {'task-state': $(taskEle).hasClass('done') ? "new" : "done"},
                                    function() {
                                        $(taskEle).toggleClass('new done');
                                    }, displayWarning);
                        }
                        else {
                            $(self).children('.desc').hide();
                            $(self).find("input").show().focus().select();
                        }
                    });

                    $(taskEdis).live('click keydown focusout', function(evt) {
                        if (evt.type == 'click') {
                            return false;
                        } else {
                            if (evt.type == 'keydown' && 13 != evt.keyCode) return;

                            var self = this;
                            var taskEle = $(self).parents('tr');

                            TasksController.update(taskEle, {'task-desc': $(self).val()}, function() {
                                var taskDesc = taskEle.find('.desc');
                                taskDesc.text($(self).val());
                                taskDesc.show();
                                $(self).hide();
                            }, displayWarning);
                        }
                    });

                    $(taskTB).sortable({
                        items: 'tr',
                        update : function() {
                            reorder();
                        }
                    });
                })();

                (function initShow() {
                    $(taskTDShowLocality).live('click', function(evt) {
                        var taskEle = $(this).parents('tr');
                        var locality = taskEle.dataset('task-locality');
                        if (!isBlank(locality)) Geo.locate({'address': locality}, function() {
                        }, displayWarning);
                    });

                })();
            })();

            refresh();

            (function initMap() {
                Geo.init(document.querySelector(mapCanvas), new google.maps.LatLng(39.9042140, 116.4074130), displayWarning);
                Geo.startWatch(hlNearbyTasks, displayWarning);
            })();
        })();
    }

    return {init: init};
};

$(function() {
    Application().init();
});
