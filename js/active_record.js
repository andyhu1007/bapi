function ActiveRecord() {
    this._connection = ActiveRecord._connection;
    this._transaction = ActiveRecord._transaction;
    this._query = ActiveRecord._query;
}

ActiveRecord._config = {
    databaseName: "bapi",
    version: "",
    desc: "Bapi Todo List",
    size: 2 * 1024 * 1024
}

ActiveRecord._connection = (function() {
    return window.openDatabase ?
            openDatabase(ActiveRecord._config.databaseName, ActiveRecord._config.version, ActiveRecord._config.desc, ActiveRecord._config.size) :
            null;
})();

ActiveRecord.asSuperOf = function(SubClass) {
    SubClass.prototype = new ActiveRecord();
    SubClass.prototype.constructor = SubClass;
    SubClass.prototype.superclass = ActiveRecord;
    SubClass.prototype.tableName = SubClass.tableName;
    SubClass.prototype.columns = SubClass.columns;

    for (var m in ActiveRecord) {
        if ("asSuperOf" == m) continue;
        SubClass[m] = ActiveRecord[m];
    }
}

ActiveRecord.prototype.save = function(callback, errCallback) {
    var self = this;
    var updates = columns2updates(self.columns);
    self._transaction(
            self._query("UPDATE " + self.tableName + " SET " + updates.sets + " WHERE id = ?", updates.values),
            callback, errCallback);

    function columns2updates(columns) {
        var sets = new Array();
        var values = new Array();
        for (var column in columns) {
            if ("id" == column) continue;
            sets.push(column + " = ?");
            values.push(self[column]);
        }
        values.push(self.id);
        return {sets: sets.join(", "), values: values};
    }
};

ActiveRecord.prototype.destroy = function(callback, errCallback) {
    var self = this;
    self._transaction(self._query("DELETE FROM " + self.tableName + " WHERE id = ?", [self.id]), callback, errCallback);
};

ActiveRecord.createTable = function(callback, errCallback) {
    var self = this;
    self._transaction(
            self._query("CREATE TABLE IF NOT EXISTS " + self.tableName + " (" + columns2cluase(self.columns) + ")"),
            callback, errCallback
            );


    function columns2cluase(columns) {
        var columnTypes = new Array();
        for (var column in columns) {
            columnTypes.push(column + " " + columns[column]);
        }
        return columnTypes.join(", ");
    }
};

ActiveRecord.dropTable = function(callback, errCallback) {
    var self = this;
    self._transaction(self._query("DROP TABLE " + self.tableName), callback, errCallback);
};

ActiveRecord.where = function(conditions, callback, errCallback) {
    var self = this;

    var where = conditions2where(conditions.where);
    self._transaction(
            self._query("SELECT * FROM " + self.tableName + where.clause + " " + conditions.order, where.params),
            function(tx, results) {
                var records = new Array();
                for (var i = 0; i < results.rows.length; i++) {
                    records.push(new self(results.rows.item(i)));
                }
                callback(records);
            }, errCallback);

    function conditions2where(whereConditions) {
        var whereClause = "";
        var params = new Array();
        for (var condition in whereConditions) {
            whereClause += (condition + " = ? ");
            params.push(whereConditions[condition]);
        }
        return {clause: ("" == whereClause ? "" : " WHERE " + whereClause)
            , params: params}
    }
};

ActiveRecord.create = function(params, callback, errCallback) {
    var self = this;
    var inserts = params2inserts(params);
    self._transaction(
            self._query("INSERT INTO " + self.tableName + " (" + inserts.columns + ") VALUES (" + inserts.marks + ")", inserts.values),
            callback, errCallback);

    function params2inserts(params) {
        var columns = new Array();
        var marks = new Array();
        var values = new Array();
        for (var column in params) {
            columns.push(column);
            marks.push('?');
            values.push(params[column]);
        }
        return {columns: columns.join(', '), marks: marks.join(', '), values: values}
    }
};

ActiveRecord._transaction = function(query, callback, errCallback) {
    this._connection.transaction(function(tx) {
        tx.executeSql(query.clause, query.params, callback, function(tx, e) {
            errCallback(e.message);
        });
    });
}

ActiveRecord._query = function(clause, params) {
    params = (params == undefined || params == null) ? [] : params;
    return {clause: clause, params: params};
}