ActiveRecord.extendedBy(Task);

function Task(taskParam) {
    this.superclass();
    this.id = taskParam.id;
    this.desc = taskParam.desc;
    this.connection = Task.connection;
};

Task.connection = (function() {
    return window.openDatabase ? openDatabase("bapi", "", "Bapi Todo List", 2 * 1024 * 1024) : null;
})();

Task.createTable = function(callback, errCallback) {
    this.connection.transaction(function(tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS tasks (id INTEGER NOT NULL PRIMARY KEY, desc TEXT NOT NULL)", [], callback, errCallback);
    });
};

Task.dropTable = function(callback, errCallback) {
    this.connection.transaction(function(tx) {
        tx.executeSql("DROP TABLE tasks", [], callback, errCallback);
    });
};

Task.find = function(callback, errCallback) {
    this.connection.transaction(function(tx) {
        tx.executeSql("SELECT * FROM tasks", [], callback, errCallback);
    });
};

Task.create = function(taskParam, callback, errCallback) {
    this.connection.transaction(function(tx) {
        tx.executeSql("INSERT INTO tasks (desc) VALUES (?)", [taskParam.desc], callback, errCallback);
    });
};