var TasksController = {
    index: function(taskEleTag, callback) {
        Task.where({order: "ORDER BY created_date, seq, id"}, function(tasks) {
            var taskEles = new Array();
            $.each(tasks, function() {
                taskEles.push(DataAttrMapper.map($(taskEleTag), this));
            });
            callback(taskEles);
        });
    },

    create: function(params, callback, errCallback) {
        Task.create(params, callback, errCallback);
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