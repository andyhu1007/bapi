function ActiveRecord() {
    this._connection = ActiveRecord._connection;
    this._transaction = ActiveRecord._transaction;
    this._query = ActiveRecord._query;
}

ActiveRecord._connection = Database.connection();
ActiveRecord._transaction = Database.transaction;

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
    var query = SQL.saveQuery(self);
    self._transaction(
            self._query("UPDATE " + self.tableName + " SET " + query.clause + " WHERE id = ?", query.values),
            callback, errCallback);
};

ActiveRecord.prototype.destroy = function(callback, errCallback) {
    var self = this;
    self._transaction(self._query("DELETE FROM " + self.tableName + " WHERE id = ?", [self.id]), callback, errCallback);
};

ActiveRecord.createTable = function(callback, errCallback) {
    var self = this;
    self._transaction(
            self._query("CREATE TABLE IF NOT EXISTS " + self.tableName + " (" + SQL.createTableQuery(self).clause + ")"),
            callback, errCallback
            );
};

ActiveRecord.dropTable = function(callback, errCallback) {
    var self = this;
    self._transaction(self._query("DROP TABLE " + self.tableName), callback, errCallback);
};

ActiveRecord.where = function(conditions, callback, errCallback) {
    var self = this;
    var select = SQL.selectQuery(conditions);
    self._transaction(
            self._query("SELECT * FROM " + self.tableName + select.where + " " + select.order, select.values),
            function(tx, results) {
                var records = new Array();
                for (var i = 0; i < results.rows.length; i++) {
                    records.push(new self(results.rows.item(i)));
                }
                callback(records);
            }, errCallback);


};

ActiveRecord.create = function(params, callback, errCallback) {
    var self = this;
    var insert = SQL.insertQuery(params);
    self._transaction(
            self._query("INSERT INTO " + self.tableName + " (" + insert.clause.columns + ") VALUES (" + insert.clause.marks + ")", insert.values),
            callback, errCallback);

};

ActiveRecord._query = function(clause, params) {
    params = isBlank(params) ? [] : params;
    return {clause: clause, params: params};
}