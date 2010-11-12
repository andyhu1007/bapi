var bapi = function() {
    var warning = $("article#notification .warning"),
            newtask = $("article#newtask #new"),
            taskList = $("article#tasks > ul"),
            tasks = $("article#tasks li"),
            taskEditors = $("article#tasks input"),
            newTasks = $("article#tasks .new"),
            removeButtons = $("article#tasks .remove");

    function refresh() {
        function clear() {
            taskList.html("");
        }

        function compose(task) {
            return $("<li class='new'></li>").
                    attr("data-taskid", task['id']).
                    append($("<span class='desc'></span>").text(task['desc'])).
                    append("<span class='button remove'>X</span>").
                    add($("<input type='text' style='display:none;'/>").
                    val(task['desc']));
        }

        function list(tx, results) {
            clear();
            for (var i = 0; i < results.rows.length; i++) {
                var task = results.rows.item(i);
                compose(task).appendTo(taskList);
            }
        }

        Task.find(list, null);
    }

    function warning(tx, e) {
        warning.html(e.message);
    }

    function init() {
        if (window.openDatabase) {
            Task.dropTable(null, null);
            Task.createTable(null, null);
        } else {
            warning.html('Web Databases not supported');
        }

        $(newtask).keydown(function(evt) {
            if (13 == evt.keyCode) {
                Task.create({desc: $(newtask).val()}, refresh, warning);
            }
        });
        $(newtask).click(function(evt) {
            $(this).select();
        });
        $(taskEditors).live('keydown', function(evt) {
            if (13 == evt.keyCode) {
                var taskEle = $(this).prev();
                var task = new Task({id: taskEle.attr('data-taskid'), desc: taskEle.next().val()})
                task.save(function(tx, results) {
                    taskEle.children('.desc').text(taskEle.next().val());
                    taskEle.next().hide();
                }, warning);
            }
        });
        tasks.live('dblclick', function(evt) {
            $(this).next().show();
            $(this).next().focus();
            $(this).next().select();
        });
        tasks.live('click', function(evt) {
            $(this).toggleClass('new done');
        });
        removeButtons.live('click', function(evt) {
            var task = new Task({id: parseInt($(this).parent("li").attr('data-taskid'))});
            var self = this;
            task.destroy(function(){$(self).parent("li").remove();}, null);
        });
    }

    return {init: init};
};

$(function() {
    bapi().init();
});
