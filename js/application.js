var Application = function() {

    function Selector() {
        this.warning = "article#notification .warning";
        this.add = "article#newtask #new";
        this.tasksArti = "article#tasks";
        this.todayTaskUL = this.tasksArti + " #today ul";
        this.todayTaskLIs = this.todayTaskUL + " li";
        this.todayTaskEdis = this.todayTaskUL + " input";
        this.todayTaskRmBts = this.todayTaskUL + " .remove";
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

            function _refresh(tasks) {
                $(todayTaskUL).html("");
                for (var i = 0; i < tasks.length; i++) {
                    _render(DataAttrMapper.map($("<li></li>"), tasks[i])).appendTo($(todayTaskUL));
                }
            }

            Task.where({order: "ORDER BY created_date, seq, id"}, _refresh);
        };

        function reorder() {
            $(todayTaskLIs).each(function(index) {
                var task = DataAttrMapper.load(this, Task);
                task.seq = index;
                task.save();
            });
        };

        (function initDB() {
            if (window.openDatabase) {
                Task.dropTable();
                Task.createTable();
            } else {
                displayWarning('Web Databases not supported');
            }
        })();

        (function initUI() {
            (function initCRUD() {
                $(add).keydown(function(evt) {
                    if (13 == evt.keyCode) {
                        Task.create({desc: $(add).val(), seq: $(todayTaskLIs).length}, refresh, displayWarning);
                    }
                    
                });

                $(add).click(function(evt) {
                    $(this).select();
                });

                $(todayTaskUL).sortable({
                    update : function() {
                        reorder();
                        refresh();
                    }
                });

                $(todayTaskLIs).live('dblclick', function(evt) {
                    $(this).find("input").show().focus().select();
                });
                $(todayTaskLIs).live('click', function(evt) {
                    var self = this;
                    $(self).dataset('task-state', $(self).hasClass('done') ? "NEW" : "DONE");
                    DataAttrMapper.load(self, Task).save(function() {
                        $(self).toggleClass('new done');
                    }, displayWarning);
                });

                $(todayTaskRmBts).live('click', function(evt) {
                    var self = this;
                    var taskEle = $(self).parent();
                    DataAttrMapper.load(taskEle, Task).destroy(function() {
                        taskEle.remove();
                    });
                }, displayWarning);

                $(todayTaskEdis).live('keydown focusout', function(evt) {
                    var self = this;
                    if (evt.type == 'keydown' && 13 != evt.keyCode) return;

                    var taskEle = $(this).parent();
                    taskEle.dataset('task-desc', $(this).val());
                    DataAttrMapper.load(taskEle, Task).save(function() {
                        taskEle.children('.desc').text($(self).val());
                        $(self).hide();
                    }, displayWarning);
                });

                $(todayTaskEdis).live('click', function(evt) {
                    return false;
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
