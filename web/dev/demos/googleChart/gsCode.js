//=============================
// Render Chart Main Flow
//=============================

function renderChart() {
    //---------------------
    // DEFINE URL
    //---------------------
    var url = "http://api.population.io/1.0/population/2017/United%20States/?format=json";
    
    //---------------------
    // LOAD POPULATION DATA
    //---------------------
    var populationDataPromise = apogee.net.jsonRequest(url);
    populationDataPromise.then(processData).catch(onRequestError);
}

function processData(populationData) {
    //---------------------
    // DEFINE OPTIONS
    //---------------------
    var options = getOptions();
    
    //---------------------
    // DEFINE COLUMNS
    //---------------------
    var columns = getColumns();
    
    //---------------------
    // CREATE ROW DATA FROM POPULATION DATA
    //---------------------
    var rows = createRowData(populationData);
    
    //---------------------
    // DRAW CHART
    //---------------------
    chartLib.drawChart(columns,rows,options);
}

function onRequestError(msg) {
    alert("Error making request: " + msg);
}

//=============================
// Render Chart Helper Functions
//=============================
function getOptions() {
    return {
        "hAxis": {
            "title": "Age"
        },
        "vAxis": {
            "title": "Population"
        },
        "backgroundColor": "#f1f8e9",
        "title": "Population by Age and Gender"
    }
}

function getColumns() {
    return [
        {
            "type": "number",
            "name": "Age"
        },
        {
            "type": "number",
            "name": "Males"
        },
        {
            "type": "number",
            "name": "Females"
        }
    ]
}

function createRowData(populationData) {
    var getRowData = entry => [entry.age,entry.males,entry.females];
    return populationData.map(getRowData);
}

