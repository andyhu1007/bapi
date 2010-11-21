Task.tableName = "tasks";
Task.columns = {
    id: "INTEGER NOT NULL PRIMARY KEY",
    desc: "TEXT NOT NULL"
};

function Task(params) {
    this.superclass(this);

    if (params != undefined && params != null) {
        for (var key in params) {
            this[key] = params[key];
        }
    }
}

ActiveRecord.asSuperOf(Task);

Task.dataAttrPre = "task";