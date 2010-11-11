var bapi = function() {
    var db = null,
            warning = document.querySelector("article#notification .warning"),
            newtask = document.querySelector("article#newtask #new");

    function initDb() {
        if (window.openDatabase) {
            db = openDatabase("bapi", "", "Bapi Todo List", 2 * 1024 * 1024);
            db.transaction(function(tx) {
                tx.executeSql("DROP TABLE tasks", []);  // to be deleted
                tx.executeSql("CREATE TABLE IF NOT EXISTS tasks (id INTEGER NOT NULL PRIMARY KEY, description TEXT NOT NULL)", []);
            });
        } else {
            warning.innerHTML = 'Web Databases not supported';
        }
    }

    function refreshList() {
        alert("one task added");
    }

    function saveTask() {
        db.transaction(function(tx) {
            tx.executeSql("INSERT INTO tasks (description) VALUES (?)", [$(newtask).val()], function(tx, results) {
                refreshList();
            }, function(tx, e) {
                warning.innerHTML = e.message;
            });
        });
    }

    function initBehaviors() {
        $(newtask).keyup(function(evt) {
            if (13 == evt.keyCode) {
                saveTask();
            }
        })
    }

    function init() {
        initDb();
        initBehaviors();
    }

    return {init: init};
};

$(function(){
    bapi().init();
});
