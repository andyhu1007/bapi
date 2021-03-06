Step.tableName = "steps";
Step.columns = {
    id: "INTEGER NOT NULL PRIMARY KEY",
    desc: "TEXT NOT NULL",
    state: "TEXT DEFAULT 'new'",
    locality: "TEXT",
    lat: 'DOUBLE',
    lng: 'DOUBLE',
    created_date: "DATE DEFAULT (date('now', 'localtime'))",
    seq: "INTEGER"
};

ActiveRecord.asSuperOf(Step);

function Step(params) {
    this.superclass(this);

    if (!isBlank(params)) {
        for (var key in params) {
            this[key] = params[key];
        }
    }
}

Step.dataAttrPre = "step";