var SQL = {
    saveQuery : function (record) {
        var sets = new Array();
        var values = new Array();
        for (var column in record.columns) {
            if ("id" == column) continue;
            sets.push(column + " = ?");
            values.push(record[column]);
        }
        values.push(record.id);
        return {clause: sets.join(", "), values: values};
    },

    createTableQuery : function(record) {
        var columnTypes = new Array();
        for (var column in record.columns) {
            columnTypes.push(column + " " + record.columns[column]);
        }
        return {clause: columnTypes.join(", ")};
    },

    selectQuery : function(conditions) {
        function where(whereCondition) {
            var clauses = new Array();
            var values = new Array();
            for (var con in whereCondition) {
                clauses.push(con + " = ?");
                values.push(whereCondition[con]);
            }
            var clause = clauses.join(' AND ');
            return {where: ("" == clause ? "" : " WHERE " + clause)
                ,values: values};
        }

        var select = {where: "", values: []}
        for (var con in conditions) {
            if ('where' == con) {
                var whereQuery = where(conditions[con]);
                for (var con in whereQuery) {
                    select[con] = whereQuery[con];
                }
            } else select[con] = conditions[con];
        }
        return select;
    },

    insertQuery : function(params) {
        var columns = new Array();
        var marks = new Array();
        var values = new Array();
        for (var column in params) {
            columns.push(column);
            marks.push('?');
            values.push(params[column]);
        }
        return {clause: {columns: columns.join(', '), marks: marks.join(', ')}, values: values}
    }

}