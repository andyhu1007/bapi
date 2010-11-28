var Application = function() {

    function Selector() {
        this.warning = "article#notification .warning";
        this.add = "article#tasks #new";
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

            function _list(tasks, target) {
                $.each(tasks, function() {
                    _render(DataAttrMapper.map($("<tr></tr>"), this)).appendTo($(target));
                });
            }

            function _groupTasks(tasks) {
                var taskGroups = {today: new Array(), past: new Array};
                $.each(tasks, function() {
                    if ((new Date().format("yyyy-mm-dd")) == this.created_date) {
                        taskGroups.today.push(this);
                    } else {
                        taskGroups.past.push(this);
                    }
                });
                return taskGroups;
            }

            function _refresh(tasks) {
                var taskGroups = _groupTasks(tasks);
                $(todayTaskTB).html("");
                $(pastTaskTB).html("");
                _list(taskGroups.today, todayTaskTB);
                _list(taskGroups.past, pastTaskTB);
            }

            Task.where({order: "ORDER BY created_date, seq, id"}, _refresh);
        }

        function reorder() {
            $(taskTBs).each(function() {
                $(this).find("tr").each(function(index) {
                    $(this).dataset('task-seq', index);
                    DataAttrMapper.load(this, Task).save();
                });
            });
        }

        (function initDB() {
            if (window.openDatabase) {
                Task.createTable();
            } else {
                displayWarning('Web Databases not supported');
            }
        })();

        (function initUI() {
            (function initCRUD() {
                $(taskTBs).sortable({
                    items: 'tr',
                    update : function() {
                        reorder();
                    }
                });

                $(add).bind('click keydown', function(evt) {
                    if (evt.type == 'click') {
                        $(this).select();
                    } else if (13 == evt.keyCode) {
                        Task.create({desc: $(add).val(), seq: $(todayTaskTB).find("tr").length}, refresh, displayWarning);
                    }
                });

                $(taskTDContents).live('click dblclick', function(evt) {
                    var self = this;
                    var taskEle = $(self).parents('tr');
                    if (evt.type == 'click') {
                        $(taskEle).dataset('task-state', $(taskEle).hasClass('done') ? "new" : "done");
                        DataAttrMapper.load(taskEle, Task).save(function() {
                            $(taskEle).toggleClass('new done');
                        }, displayWarning);
                    } else {
                        $(self).find("input").show().focus().select();
                    }
                });

                $(taskRmBts).live('click', function(evt) {
                    var self = this;
                    var taskEle = $(self).parents('tr');
                    DataAttrMapper.load(taskEle, Task).destroy(function() {
                        taskEle.remove();
                        reorder();
                    }, displayWarning);
                });

                $(taskEdis).live('click keydown focusout', function(evt) {
                    if (evt.type == 'click') {
                        return false;
                    } else {
                        var self = this;
                        if (evt.type == 'keydown' && 13 != evt.keyCode) return;

                        var taskEle = $(self).parents('tr');
                        taskEle.dataset('task-desc', $(self).val());
                        DataAttrMapper.load(taskEle, Task).save(function() {
                            taskEle.find('.desc').text($(self).val());
                            $(self).hide();
                        }, displayWarning);
                    }
                });

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
