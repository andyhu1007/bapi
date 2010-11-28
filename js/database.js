var Database = {
    config : {
        name: "bapi",
        version: "",
        desc: "Bapi Todo List",
        size: 2 * 1024 * 1024
    },

    connection : function() {
        return window.openDatabase ?
                openDatabase(Database.config.name, Database.config.version, Database.config.desc, Database.config.size) :
                null;
    },

    transaction : function(query, callback, errCallback) {
        this._connection.transaction(function(tx) {
            tx.executeSql(query.clause, query.params, callback, function(tx, e) {
                errCallback(e.message);
            });
        });
    }

}
