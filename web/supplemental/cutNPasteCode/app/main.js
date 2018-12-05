requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '.',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app'
    }
});

// Start the main app logic.
requirejs(['apogee-web-app'],function(apogeeapp) {
    
	//set the unload checker as a global
	window.beforeUnloadHandler = function() {
		var app = apogeeapp.app.Apogee.getInstance();
		if((app)&&(app.getWorkspaceIsDirty())) {
			return "There is unsaved data. Are you sure you want to exit?";
		}
		else {
			return undefined;
		}
	}
	
	//initialize resource path
	apogeeapp.ui.initResourcePath("resources");
	
	//create the application
	apogeeapp.app.Apogee.createApp("appContainer");
});