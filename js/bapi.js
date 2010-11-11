var bapi = function() {
    var db = null,
            warning = $("article#notification .warning"),
            newtask = $("article#newtask #new"),
            tasks = $("article#tasks > ul");

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

    function refreshTasks() {
        db.transaction(function(tx) {
            tasks.html("");
            tx.executeSql("SELECT * FROM tasks", [], function(tx, results){
                for (var i = 0; i < results.rows.length; i++) {
                    var task = results.rows.item(i);
                    $("<li></li>").text(task['desc']).appendTo(tasks);
                }
            });
        });
    }

    function saveTask() {
        db.transaction(function(tx) {
            tx.executeSql("INSERT INTO tasks (desc) VALUES (?)", [$(newtask).val()], function(tx, results) {
                refreshTasks();
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
