var TasksController = {
    index: function(taskEleTag, callback, errCallback) {
        Task.where({order: "created_date, seq, id"}, function(tasks) {
            var taskEles = new Array();
            $.each(tasks, function() {
                taskEles.push(DataAttrMapper.map($(taskEleTag), this));
            });
            callback(taskEles);
        }, errCallback);
    },

    create: function(params, callback, errCallback) {
        Task.where("WHERE created_date = (date('now', 'localtime'))", function(tasks) {
            params.seq = tasks.length;
            Task.create(params, callback, errCallback);
        }, errCallback);
    },

    update : function(taskEle, params, callback, errCallback) {
        for (var attribute in params) {
            taskEle.dataset(attribute, params[attribute])
        }
        DataAttrMapper.load(taskEle, Task).save(callback, errCallback);
    },

    destroy : function(taskEle, callback, errCallback) {
        DataAttrMapper.load(taskEle, Task).destroy(callback, errCallback);
    },

    updateOrder: function(taskEles) {
        taskEles.each(function(index) {
            $(this).dataset('task-seq', index);
            DataAttrMapper.load(this, Task).save();
        });
    }
}