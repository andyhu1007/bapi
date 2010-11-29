var Application = function() {

    function Selector() {
        this.warning = "article#notification .warning";
        this.newTask = "article#tasks #new";
        this.newTaskDesc = this.newTask + " #desc";
        this.newTaskLocality = this.newTask + " #locality";
        this.newTaskLocalityFinder = this.newTask + " #getGeo";

        this.map = "#map";
        this.mapHeader = this.map + " header";
        this.mapCanvas = this.map + " #map_canvas";

        this.importer = "#importer";
        this.importerHeader = this.importer + " header";
        this.importerBox = this.importer + " #import";

        this.tasksArti = "article#tasks";
        this.taskTBs = this.tasksArti + " table";
        this.taskTRs = this.taskTBs + " tr";
        this.taskTDContents = this.taskTRs + " td.content"
        this.taskEdis = this.taskTBs + " input";
        this.taskRmBts = this.tasksArti + " .remove";

        this.todayTaskTB = this.tasksArti + " #today table";
        this.pastTaskTB = this.tasksArti + " #past table";

        this.manualArti = "article#manual"
        this.manualHeader = this.manualArti + " header";
        this.manualSec = this.manualArti + " section";

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
            function refresh() {
                function _render(element) {
                    function locality() {
                        var address = element.dataset('task-locality');
                        address = isBlank(address) ? '' : '@' + address;
                        return $("<td class='locality'></td>").append($("<address></address>").text(address))
                    }

                    return element.addClass(element.dataset('task-state')).
                            append(
                            $("<td class='content'></td>").
                                    append($("<span class='desc'></span>").text(element.dataset('task-desc'))).
                                    append($("<input type='text'/>").val(element.dataset('task-desc')))
                            ).
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

                function _groupTaskEles(taskEles) {
                    var taskEleGroups = {today: new Array(), past: new Array};
                    $.each(taskEles, function() {
                        if ((new Date().format("yyyy-mm-dd")) == this.dataset('task-created_date')) {
                            taskEleGroups.today.push(this);
                        } else {
                            taskEleGroups.past.push(this);
                        }
                    });
                    return taskEleGroups;
                }

                function _refresh(taskEles) {
                    var taskEleGroups = _groupTaskEles(taskEles);
                    $(todayTaskTB).html("");
                    $(pastTaskTB).html("");
                    _list(taskEleGroups.today, todayTaskTB);
                    _list(taskEleGroups.past, pastTaskTB);
                }

                TasksController.index("<tr></tr>", _refresh);

            }

            function reorder() {
                $(taskTBs).each(function() {
                    TasksController.updateOrder($(this).find("tr"));
                });
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
                                    Geo.locate(locality, function(location) {
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
                                    if ('' != $.trim(this)) tasksParams.push({desc: this});
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

                    $(taskTBs).sortable({
                        items: 'tr',
                        update : function() {
                            reorder();
                        }
                    });
                })();
            })();

            (function initManual() {
                $(manualHeader).click(function(evt) {
                    $(manualSec).slideToggle('slow');
                })
            })();

            refresh();

            Geo.initialize({lat: 39.9042140, lng: 116.4074130}, document.querySelector(mapCanvas))

        })();
    }

    return {init: init};
};

$(function() {
    Application().init();
});
