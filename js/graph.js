var Graph = function(vertexNum) {
    this._vertexNum = vertexNum <= 0 ? 0 : vertexNum;

    this._vertexArcs = new Array();
    for (var i = 0; i < this._vertexNum; i++) {
        var row = new Array();
        for (var j = 0; j < this._vertexNum; j++) {
            row.push(-1);
        }
        this._vertexArcs.push(row);
    }

    this.val = function(i, j, value) {
        if (isBlank(value)) {
            return this._vertexArcs[i][j];
        } else {
            this._vertexArcs[i][j] = value;
            return value;
        }
    };

    this.maxArcs = function() {
        return (this._vertexNum * (this._vertexNum - 1)) / 2;
    };
};