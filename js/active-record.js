function ActiveRecord() {
};

ActiveRecord.extendedBy = function(SubClass) {
    SubClass.prototype = new ActiveRecord();
    SubClass.prototype.constructor = SubClass;
    SubClass.prototype.superclass = ActiveRecord;
}

ActiveRecord.prototype.save = function(callback, errCallback) {
    var self = this;
    this.connection.transaction(function(tx) {
        tx.executeSql("UPDATE tasks SET desc = ? WHERE id = ?", [self.desc, self.id], callback, errCallback);
    });
};

ActiveRecord.prototype.destroy = function(callback, errCallback) {
    var self = this;
    this.connection.transaction(function(tx) {
        tx.executeSql("DELETE FROM tasks WHERE id = ?", [self.id], callback, errCallback);
    });
};
