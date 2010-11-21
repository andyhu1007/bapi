Task.tableName = 'tasks';
Task.columns = {
    id: "INTEGER NOT NULL PRIMARY KEY",
    desc: "TEXT NOT NULL"
};

function Task() {
    this.superclass(this);
};

ActiveRecord.asSuperOf(Task);