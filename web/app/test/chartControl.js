(function() {
////////////////////////////////////////////////////////////////////////////////
function createInstance() {
    return new ChartControl();
}

function ChartControl() {
    
}

ChartControl.prototype.setWindow = function(window) {
    this.window = window;
}

ChartControl.prototype.showMessage = function(msg) {
    var contentElement = this.window.getContent();
    contentElement.innerHTML = msg;
}

//============================
// Register Control
//============================

//create the control bundle
var localControlBundle = {};
localControlBundle.name = "Chart Control";
localControlBundle.createInstance = createInstance;

//temporary registration mechanism
if(registerControl) {
    registerControl(localControlBundle);
}

////////////////////////////////////////////////////////////////////////////////
}
)();


