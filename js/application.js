var Application = function() {

    function Selector() {
        this.warning = "article#notification .warning";
        this.add = "article#newtask #new";
        this.tasksArti = "article#tasks";
        this.taskULs = this.tasksArti + " ul";
        this.taskLIs = this.tasksArti + " li";
        this.taskEdis = this.tasksArti + " input";
        this.taskRmBts = this.tasksArti + " .remove";

        this.todayTaskUL = this.tasksArti + " #today ul";

        this.pastTaskUL = this.tasksArti + " #past ul";
    }

    Selector.apply(this);

    function init() {
        function displayWarning(message) {
            $(warning).html(message);
        }

        function refresh() {
            function _render(element) {
                return element.addClass('new').
                        append($("<span class='desc'></span>").text(element.dataset('task-desc'))).
                        append($("<input type='text' style='display:none;'/>").val(element.dataset('task-desc'))).
                        append("<span class='button remove'>X</span>");
            }

            function _list(tasks, target) {
                $.each(tasks, function() {
                    _render(DataAttrMapper.map($("<li></li>"), this)).appendTo($(target));
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
                $(todayTaskUL).html("");
                $(pastTaskUL).html("");
                _list(taskGroups.today, todayTaskUL);
                _list(taskGroups.past, pastTaskUL);
            }

            Task.where({order: "ORDER BY created_date, seq, id"}, _refresh);
        }

        function reorder() {
            $(taskULs).each(function() {
                $(this).find("li").each(function(index) {
                    var task = DataAttrMapper.load(this, Task);
                    task.seq = index;
                    task.save();
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
                $(add).bind('click keydown', function(evt) {
                    if (evt.type == 'click') {
                        $(this).select();
                    } else if (13 == evt.keyCode) {
                        Task.create({desc: $(add).val(), seq: $(todayTaskUL).find("li").length}, refresh, displayWarning);
                    }
                });

                $(taskULs).sortable({
                    update : function() {
                        reorder();
                        refresh();
                    }
                });

                $(taskLIs).live('click dblclick', function(evt) {
                    var self = this;
                    if (evt.type == 'click') {
                        $(self).dataset('task-state', $(self).hasClass('done') ? "NEW" : "DONE");
                        DataAttrMapper.load(self, Task).save(function() {
                            $(self).toggleClass('new done');
                        }, displayWarning);
                    } else {
                        $(self).find("input").show().focus().select();
                    }
                });

                $(taskRmBts).live('click', function(evt) {
                    var self = this;
                    var taskEle = $(self).parent();
                    DataAttrMapper.load(taskEle, Task).destroy(function() {
                        taskEle.remove();
                    });
                }, displayWarning);

                $(taskEdis).live('click keydown focusout', function(evt) {
                    if (evt.type == 'click') {
                        return false;
                    } else {
                        var self = this;
                        if (evt.type == 'keydown' && 13 != evt.keyCode) return;

                        var taskEle = $(this).parent();
                        taskEle.dataset('task-desc', $(this).val());
                        DataAttrMapper.load(taskEle, Task).save(function() {
                            taskEle.children('.desc').text($(self).val());
                            $(self).hide();
                        }, displayWarning);
                    }
                });

            })();
            refresh();
        })();

    }

    return {init: init};
};

$(function() {
    Application().init();
});
