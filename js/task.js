Task.tableName = "tasks";
Task.columns = {
    id: "INTEGER NOT NULL PRIMARY KEY",
    desc: "TEXT NOT NULL",
    state: "TEXT DEFAULT 'new'",
    created_date: "DATE DEFAULT (date('now', 'localtime'))",
    seq: "INTEGER"
};

function Task(params) {
    this.superclass(this);

    if (!isBlank(params)) {
        for (var key in params) {
            this[key] = params[key];
        }
    }
}

ActiveRecord.asSuperOf(Task);

Task.dataAttrPre = "task";