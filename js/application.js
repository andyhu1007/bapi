var Application = function() {

    function Selector() {
        this.warning = "article#notification .warning";
        this.add = "article#newtask #new";
        this.tasksArti = "article#tasks";
        this.taskUL = this.tasksArti + " > ul";
        this.taskLIs = this.tasksArti + " li";
        this.taskEdis = this.tasksArti + " input";
        this.taskRmBts = this.tasksArti + " .remove";
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
                        append("<span class='button remove'>X</span>").
                        add($("<input type='text' style='display:none;'/>").
                        val(element.dataset('task-desc')));
            }

            function _refresh(tasks) {
                $(taskUL).html("");
                for (var i = 0; i < tasks.length; i++) {
                    _render(DataAttrMapper.map($("<li></li>"), tasks[i])).appendTo($(taskUL));
                }
            }

            Task.where({}, _refresh);
        }


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
                        Task.create({desc: $(add).val()}, refresh, displayWarning);
                    }
                });

                $(add).click(function(evt) {
                    $(this).select();
                });

                $(taskLIs).live('dblclick', function(evt) {
                    $(this).next().show().focus().select();
                });
                $(taskLIs).live('click', function(evt) {
                    var self = this;
                    $(self).dataset('task-state', $(self).hasClass('done') ? "NEW" : "DONE");
                    DataAttrMapper.load(self, Task).save(function() {
                        $(self).toggleClass('new done');
                    }, displayWarning);
                });
                $(taskRmBts).live('click', function(evt) {
                    var self = this;
                    var taskEle = $(self).parent();
                    DataAttrMapper.load(taskEle, Task).destroy(function() {
                        taskEle.remove();
                    });
                }, displayWarning);

                $(taskEdis).live('keydown', function(evt) {
                    if (13 == evt.keyCode) {
                        var taskEle = $(this).prev();
                        taskEle.dataset('task-desc', $(this).val());
                        DataAttrMapper.load(taskEle, Task).save(function() {
                            taskEle.children('.desc').text(taskEle.next().val());
                            taskEle.next().hide();
                        }, displayWarning);
                    }
                });
            })();
        })();

    }

    return {init: init};
};

$(function() {
    Application().init();
});
