Task.tableName = 'tasks';
Task.columns = {
    id: "INTEGER NOT NULL PRIMARY KEY",
    desc: "TEXT NOT NULL"
};

function Task(param) {
    this.superclass(this);

    for(var column in param) {
        this[column] = param[column];
    }
};

ActiveRecord.asSuperOf(Task);