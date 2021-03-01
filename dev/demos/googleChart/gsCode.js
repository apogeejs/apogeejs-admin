//=============================
// constants
//=============================

const url = "http://api.population.io/1.0/population/2017/United%20States/?format=json";

const columns = [
	"Age",
	"Males",
	"Females"
];

const options = {
	"hAxis": {
		"title": "Person's Age"
	},
	"backgroundColor": "#f1f8e9",
	"title": "Population by Age and Gender",
	"height": 400,
	"width": 600
}

//=============================
// Render Chart Main Flow
//=============================

function renderChart() {
    
    //---------------------
    // LOAD POPULATION DATA
    //---------------------
    var populationDataPromise = .jsonRequest(url);
    populationDataPromise.then(processData).catch(onRequestError);
}

function processData(populationData) {
    
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

function createRowData(populationData) {
    var getRowData = entry => [entry.age,entry.males,entry.females];
    return populationData.map(getRowData);
}

