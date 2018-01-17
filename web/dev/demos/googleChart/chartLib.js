var chartLib = (function() {
    
    //================
    //private function
    //================

    var _chart = null;
    var _containerId = null;
    
    function _instantiateChart(containerId) {
        var container = document.getElementById(containerId);
        if(!container) {
            alert("Container element not found!");
            return;
        }
        return new google.visualization.LineChart(container);
    }
    
    function _createDataTable(columns,rows) {
        var dataTable = new google.visualization.DataTable();
        for(var i = 0; i < columns.length; i++) {
            var columnInfo = columns[i];
            dataTable.addColumn(columnInfo.type,columnInfo.name);
        }
        dataTable.addRows(rows);
        return dataTable;
    }

    //================
    //public functions
    //================
    
    var setup = function(containerId,chartLoadedCallback) {
        _containerId = containerId;
        
        //load googl chart
        google.charts.load('current', {packages: ['corechart']});
        google.charts.setOnLoadCallback(chartLoadedCallback);    
    }

    var drawChart = function(columns,rows,options) {
        if(!options) options = {}; 
        if(!_chart) {
            _chart = _instantiateChart(_containerId);
        }
        var chartData = _createDataTable(columns,rows);     
        _chart.draw(chartData, options);
    }

    var wrapper = {};
    wrapper.setup = setup;
    wrapper.drawChart = drawChart;
    return wrapper;
}());
