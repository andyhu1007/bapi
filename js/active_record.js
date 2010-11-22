function ActiveRecord() {
    this.connection = ActiveRecord.connection;
}
;

ActiveRecord.config = {
    databaseName: "bapi",
    version: "",
    desc: "Bapi Todo List",
    size: 2 * 1024 * 1024
}

ActiveRecord.connection = (function() {
    return window.openDatabase ?
            openDatabase(ActiveRecord.config.databaseName, ActiveRecord.config.version, ActiveRecord.config.desc, ActiveRecord.config.size) :
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
    self.connection.transaction(function(tx) {
        var updates = columns2updates(self.columns);
        tx.executeSql("UPDATE " + self.tableName + " SET " + updates.sets + " WHERE id = ?",
                updates.values, callback, function(tx, e) {
            errCallback(e.message);
        });
    });

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
    self.connection.transaction(function(tx) {
        tx.executeSql("DELETE FROM " + self.tableName + " WHERE id = ?", [self.id], callback, function(tx, e) {
            errCallback(e.message);
        });
    });
};

ActiveRecord.createTable = function(callback, errCallback) {
    var self = this;
    self.connection.transaction(function(tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS " + self.tableName + " (" + columns2cluase(self.columns) + ")", [], callback, function(tx, e) {
            errCallback(e.message);
        });
    });

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
    self.connection.transaction(function(tx) {
        tx.executeSql("DROP TABLE " + self.tableName, [], callback, function(tx, e) {
            errCallback(e.message);
        });
    });
};

ActiveRecord.where = function(conditions, callback, errCallback) {
    var self = this;

    self.connection.transaction(function(tx) {
        var where = conditions2where(conditions.where);
        tx.executeSql("SELECT * FROM " + self.tableName + where.clause + " " + conditions.order, where.params, function(tx, results) {
            var records = new Array();
            for (var i = 0; i < results.rows.length; i++) {
                records.push(new self(results.rows.item(i)));
            }
            callback(records);
        }, function(tx, e) {
            errCallback(e.message);
        });
    });

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
    self.connection.transaction(function(tx) {
        var inserts = params2inserts(params);
        tx.executeSql("INSERT INTO " + self.tableName + " (" + inserts.columns + ") VALUES (" + inserts.marks + ")",
                inserts.values, callback, function(tx, e) {
            errCallback(e.message);
        });
    });

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