/* 
 * Serialization and deserialization are put in the app because the UI is holding
 * special information to create and edit the objects, as opposed to the data that
 * is held by thee objects themselves. The child object allows for the object to store 
 * some unspecified data to be used by the editor.
 * 
 * IO am not 100% sure about this right now, but it is the most sesible thign for the time being.
 */

/** PLAN
 * - read all the objects
 * - create all named objects
 * - do a single multi object update event to set all data as needed 

/** This is used for saving the workspace. */
visicomp.visiui.workspaceToJson = function(workspace) {
    var json = {};
    json.name = workspace.getName();
    json.fileType = "visicompWorkspace";
    json.data = visicomp.visiui.childToJson(workspace.getRootPackage());
    return json;
}

visicomp.visiui.childToJson = function(child) {
    var json = {};
    json.name = child.getName();
    json.type = child.getType();
    
    var temp;
    
    switch(json.type) {
        case "package":
            json.children = {};
            var childMap = child.getChildMap();
            for(var key in childMap) {
                var childChild = childMap[key];
                json.children[key] = visicomp.visiui.childToJson(childChild);
            }
            break;
            
        case "table":
            temp = child.getEditorInfo();
            if(temp) {
                json.formula = temp;
                json.supplementalCode = child.getSupplementalCode();
            }
            else {
                json.data = child.getData();
            }
            break;
            
        case "function":
            json.argParens = child.getArgParensString();
            json.functionBody = child.getEditorInfo();
            json.supplementalCode = child.getSupplementalCode();
            break;
            
    }
    
    return json;
}
