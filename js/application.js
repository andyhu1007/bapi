var Application = function() {

    function Selector() {
        this.warning = "article#notification .warning";
        this.newTask = "article#tasks #new";
        this.importer = "article#tasks #importer";
        this.importerHeader = "article#tasks header";
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
                    return element.addClass(element.dataset('task-state')).
                            append(
                            $("<td class='content'></td>").
                                    append($("<span class='desc'></span>").text(element.dataset('task-desc'))).
                                    append($("<input type='text' style='display:none;'/>").val(element.dataset('task-desc')))
                            ).
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
                    $(newTask).bind('click keydown', function(evt) {
                        if (evt.type == 'click') {
                            $(this).select();
                        } else if (13 == evt.keyCode) {
                            TasksController.create({desc: $(newTask).val()}, refresh, displayWarning);
                        }
                    });

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
                                taskEle.find('.desc').text($(self).val());
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
        })();
    }

    return {init: init};
};

$(function() {
    Application().init();
});
