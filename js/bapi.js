$(function initDb() {
    var db = null,
    warning = document.querySelector("article#notification .warning");
    try {
        if (window.openDatabase) {
            db = openDatabase("bapi", "1.0", "Bapi Todo List", 200000);
            if (db) {
                db.transaction(function(tx) {
                    tx.executeSql("CREATE TABLE IF NOT EXISTS tasks (id REAL UNIQUE, description TEXT)", []);
                });
            } else {
                warning.innerHTML = 'error occurred trying to open DB';
            }
        } else {
            warning.innerHTML = 'Web Databases not supported';
        }
    } catch (e) {
        warning.innerHTML = 'error occurred during DB init, Web Database supported?';
    }
});
