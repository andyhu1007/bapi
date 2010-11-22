Task.tableName = "tasks";
Task.columns = {
    id: "INTEGER NOT NULL PRIMARY KEY",
    desc: "TEXT NOT NULL",
    state: "TEXT DEFAULT 'NEW'",
    created_date: "DATE DEFAULT CURRENT_DATE",
    seq: "INTEGER"
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