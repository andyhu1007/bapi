var bapi = function() {
    var db = null,
            warning = $("article#notification .warning"),
            newtask = $("article#newtask #new"),
            taskList = $("article#tasks > ul"),
            tasks = $("article#tasks li"),
            newTasks = $("article#tasks .new");

    function initDB() {
        if (window.openDatabase) {
            db = openDatabase("bapi", "", "Bapi Todo List", 2 * 1024 * 1024);
            db.transaction(function(tx) {
                tx.executeSql("DROP TABLE tasks", []);  // to be deleted
                tx.executeSql("CREATE TABLE IF NOT EXISTS tasks (id INTEGER NOT NULL PRIMARY KEY, desc TEXT NOT NULL)", []);
            });
        } else {
            warning.html('Web Databases not supported');
        }
    }

    function refresh() {
        function compose(task) {
            return $("<li class='new'></li>").text(task['desc']).append("<span class='clickable remove'>X</span>");
        }

        function enhance(ele) {
            ele.click(function(evt) {
                $(this).removeClass('new').addClass('done');
            });
            return ele;
        }

        db.transaction(function(tx) {
            taskList.html("");
            tx.executeSql("SELECT * FROM tasks", [], function(tx, results) {
                for (var i = 0; i < results.rows.length; i++) {
                    var task = results.rows.item(i);
                    enhance(compose(task)).appendTo(taskList);
                }
            });
        });
    }


    function saveTask() {
        db.transaction(function(tx) {
            tx.executeSql("INSERT INTO tasks (desc) VALUES (?)", [$(newtask).val()], function(tx, results) {
                refresh();
            }, function(tx, e) {
                warning.html(e.message);
            });
        });
    }

    function initBehaviors() {
        $(newtask).keydown(function(evt) {
            if (13 == evt.keyCode) {
                saveTask();
            }
        })
    }

    function init() {
        initDB();
        initBehaviors();
    }

    return {init: init};
};

$(function() {
    bapi().init();
});
