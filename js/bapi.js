var Bapi = function() {

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
        function dbWarning(tx, e) {
            $(warning).html(e.message);
        }

        function refresh() {
            function _compose(task) {
                return _render(DataAttrMapper.apply($("<li></li>"), task, 'task'));
            }

            function _render(element) {
                return element.addClass('new').
                        append($("<span class='desc'></span>").text(element.dataset('task-desc'))).
                        append("<span class='button remove'>X</span>").
                        add($("<input type='text' style='display:none;'/>").
                        val(element.dataset('task-desc')));
            }

            function _refresh(tx, results) {
                $(taskUL).html("");
                for (var i = 0; i < results.rows.length; i++) {
                    _compose(results.rows.item(i)).appendTo($(taskUL));
                }
            }

            Task.where({}, _refresh);
        }


        (function initDB() {
            if (window.openDatabase) {
                Task.dropTable();
                Task.createTable();
            } else {
                $(warning).html('Web Databases not supported');
            }
        })();

        (function initUI() {
            (function initCRUD() {
                $(add).keydown(function(evt) {
                    if (13 == evt.keyCode) {
                        Task.create({desc: $(add).val()}, refresh, dbWarning);
                    }
                });

                $(add).click(function(evt) {
                    $(this).select();
                });

                $(taskLIs).live('dblclick', function(evt) {
                    $(this).next().show().focus().select();
                });
                $(taskLIs).live('click', function(evt) {
                    $(this).toggleClass('new done');
                });
                $(taskRmBts).live('click', function(evt) {
                    var self = this;
                    var taskEle = $(self).parent();
                    var task = new Task({id: taskEle.attr('data-task-id')});
                    task.destroy(function() {
                        taskEle.remove();
                    });
                }, dbWarning);

                $(taskEdis).live('keydown', function(evt) {
                    if (13 == evt.keyCode) {
                        var taskEle = $(this).prev();
                        new Task({id: taskEle.attr('data-task-id'), desc: taskEle.next().val()}).save(function(tx, results) {
                            taskEle.children('.desc').text(taskEle.next().val());
                            taskEle.next().hide();
                        }, dbWarning);
                    }
                });
            })();
        })();

    }

    return {init: init};
};

$(function() {
    Bapi().init();
});
