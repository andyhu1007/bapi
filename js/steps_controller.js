var StepsController = {
    index: function(stepEleTag, callback, errCallback) {
        Step.where({order: "created_date, seq, id"}, function(steps) {
            var stepEles = new Array();
            $.each(steps, function() {
                stepEles.push(DataAttrMapper.map($(stepEleTag), this));
            });
            callback(stepEles);
        }, errCallback);
    },

    create: function(params, callback, errCallback) {
        Step.where({}, function(steps) {
            function createInstance(params, index) {
                params.seq = index;
                Step.create(params, callback, errCallback);
            }

            var nextSeq = steps.length;
            if (params instanceof Array) {
                $.each(params, function(index) {
                    createInstance(this, nextSeq + index);
                });
            } else createInstance(params, nextSeq);
        }, errCallback);
    },

    update : function(stepEle, params, callback, errCallback) {
        for (var attribute in params) {
            stepEle.dataset(attribute, params[attribute])
        }
        DataAttrMapper.load(stepEle, Step).save(callback, errCallback);
    },

    destroy : function(stepEle, callback, errCallback) {
        DataAttrMapper.load(stepEle, Step).destroy(callback, errCallback);
    },

    updateOrder: function(stepEles) {
        stepEles.each(function(index) {
            $(this).dataset('step-seq', index);
            DataAttrMapper.load(this, Step).save();
        });
    }
}