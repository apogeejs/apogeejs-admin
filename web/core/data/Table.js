/** This class encapsulatees a data table */
visicomp.core.Table = function(name) {
	
	this.parent = null;
    this.name = name;
	
    //this contains the formula and dependency information
    this.codeInfo = null;
	
    //these are a list of tables that depend on this table
    this.impactsList = [];
	
    //data is not yet initialized
    this.data = null;
	
    //this is the ui object that displays this table
    this.displayObject = null;

}

/** Test function. */
visicomp.core.Table.prototype.print = function() {
    console.log("name: " + this.data);
}

/** This method returns the name for this object. */
visicomp.core.Table.prototype.getName = function() {
    return this.name;
}

/** This method returns the full name in dot notation for this object. */
visicomp.core.Table.prototype.getFullName = function() {
	if(this.parent) {
		if(this.parent.isRootPackage()) {
			return this.name;
		}
		else {
			return this.parent.getFullName() + "." + this.name;
		}
	}
	else {
		return this.name;
	}
}

/** This identifies the type of object. */
visicomp.core.Table.prototype.getType = function() {
	return "table";
}

/** This returns the parent for this package. For the root package
 * this value is null. */
visicomp.core.Table.prototype.getParent = function() {
	return this.parent;
}

/** This sets the parent for this package.
 * @private*/
visicomp.core.Table.prototype.setParent = function(parent) {
	this.parent = parent;
}


/** This is used for saving the workspace. */
visicomp.core.Table.prototype.toJson = function() {
    var json = {};
    json.name = this.name;
    if((this.codeInfo)&&(this.codeInfo.formula)) {
        json.formula = this.codeInfo.formula;
        if(this.codeInfo.supplementalCode) {
            json.supplementalCode = this.codeInfo.supplementalCode;
        }
    }
    else {
        json.data = this.data;
    }
    return json;
}

/** This method gets the dependency manager. */
visicomp.core.Table.prototype.hasFormula = function() {
    return (this.codeInfo != null);
}

/** This method returns the data for this object. */
visicomp.core.Table.prototype.getData = function() {
    return this.data;
}

/** This method sets the data for this object. It also
 * freezes the object so it is immutable. */
visicomp.core.Table.prototype.setData = function(data) {
    this.data = data;
	
	//make this object immutable
	visicomp.core.util.deepFreeze(data);
	
	//store the new object in the parent
    this.parent.updateData(this);
}

/** This method returns the name for this object. */
visicomp.core.Table.prototype.getPackage = function() {
    return this.parent;
}

/** This gets the workspace for this table. */
visicomp.core.Table.prototype.getWorkspace = function() {
	return this.parent.getWorkspace();
}

/** This method returns the code array. The code array
 * includees segments of code,referencing the code pattern. */
visicomp.core.Table.prototype.getCodeInfo = function() {
    return this.codeInfo;
}

/** This method sets the code info.*/
visicomp.core.Table.prototype.setCodeInfo = function(codeInfo) {
	
    var oldDependsOn = this.getDependsOn();
	
    this.codeInfo = codeInfo;
	
    var currentDependsOn = this.getDependsOn();
    this.updateDependencies(currentDependsOn, oldDependsOn);
    
    if(codeInfo != null) {
        this.createUpdateCommand();
    }
    else {
        this.clearUpdateCommand();
    }
}

/** This returns an array of objects this obejct impacts. */
visicomp.core.Table.prototype.getImpactsList = function() {
    return this.impactsList;
}

/** This returns a map of the objects that this object depends on. */
visicomp.core.Table.prototype.getDependsOn = function() {
    if(this.codeInfo) {
        return this.codeInfo.dependsOn;
    }
    else {
        return [];
    }
}

/** this method adds a data object to the imapacts list for this node. */
visicomp.core.Table.prototype.addToImpactsList = function(table) {
    //exclude this table
    if(table == this) return;
	
    //make sure it appears only once
    for(var i = 0; i < this.impactsList.length; i++) {
        if(this.impactsList[i] == table) return;
    }
    //add to the list
    this.impactsList.push(table);
}

/** this method removes a data object from the imapacts list for this node. */
visicomp.core.Table.prototype.removeFromImpactsList = function(table) {
    //it should appear only once
    for(var i = 0; i < this.impactsList.length; i++) {
        if(this.impactsList[i] == table) {
            this.impactsList.splice(i,1);
            return;
        }
    }
}

/** This calls the update method updates the data objet, setting up the context
 * appropriately. The commands should be set up with the assumption the following
 * variables will be in context: _workspace, _package and _table. */
visicomp.core.Table.prototype.runUpdateCommand = function() {
    var tableName = this.getName();
    var packageName = this.parent.getName();
    var workspaceName = this.parent.getWorkspace().getName();
	
    //we execute the function here so the user can debug it easily
    visicomp.core.runTableFormula(tableName,packageName,workspaceName);
}

/** This sets the dependencies based on the code for the object. 
 * @private */
visicomp.core.Table.prototype.updateDependencies = function(currentDependsOn,oldDependsOn) {
	
    //update the dependency links among the objects
	var newDependencySet = {};
    var remoteTable;
    var i;
    for(i = 0; i < currentDependsOn.length; i++) {
        remoteTable = currentDependsOn[i].table;
		
		//update this object
		remoteTable.addToImpactsList(this);

		//create a set of new tables to use below
		newDependencySet[remoteTable.getFullName()] = true;
    }
	
    //update for links that have gotten deleted
    for(i = 0; i < oldDependsOn.length; i++) {
        remoteTable = oldDependsOn[i].table;
		
		var stillDependsOn = newDependencySet[remoteTable.getFullName()];
		
		if(!stillDependsOn) {
			//remove from imacts list
			remoteTable.removeFromImpactsList(this);
		}
    }
}

/** This method returns the formula for this table. 
 * @private */
visicomp.core.Table.prototype.getFormula = function() {
    var f;
    if(this.codeInfo) {
        f = this.codeInfo.formula;
    }
    if(!f) f = "";
    return f;
}

/** This method returns the supplemental code for this table. 
 * @private */
visicomp.core.Table.prototype.getSupplementalCode = function() {
    var sc;
    if(this.codeInfo) {
        sc = this.codeInfo.supplementalCode;
    }
    if(!sc) sc = "";
    return sc;
}

/** This method creates the table update javascript, which will be added to the
 * html page so the user easily can run it in the debugger if needed. 
 * @private */
visicomp.core.Table.prototype.createUpdateCommand = function() {
    
    var tableFullName = this.getFullName();
    var workspaceName = this.parent.getWorkspace().getName();
    
    var accessedVariableString = this.getAccessedVariableCode();
    
    var formula = this.getFormula();
    var supplementalCode = this.getSupplementalCode();
    
    //create the code body
    var codeBody = visicomp.core.util.formatString(
        visicomp.core.Table.TABLE_UPDATE_FORMAT_TEXT,
        tableFullName,
        workspaceName,
        accessedVariableString,
        formula,
        supplementalCode
    );
     
    //create the code command
    visicomp.core.Table.makeUpdateCommand(codeBody);
}

/** This methoc evaluates the update command tect to make the update command.
 * It is separated so there is no context and minimal added closure variables 
 * in the eval statement. 
 * @private */
visicomp.core.Table.prototype.clearUpdateCommand = function() {
    delete visicomp.core.updateCode[this.getWorkspace().getName()][this.getFullName()];
}

/** This methoc evaluates the update command tect to make the update command.
 * It is separated so there is no context and minimal added closure variables 
 * in the eval statement. 
 * @private */
visicomp.core.Table.makeUpdateCommand = function(_commandText) {
    eval(_commandText);
}

/** This method creates the access variable code. It makes short cuts
 * to all the accessed tables. The users should use the shortcuts and not
 * some othermethod off accessing the tables because use of these shortcuts
 * determines the dependencies of the tables, which is need to find the
 * table calculation order. 
 * @private */
visicomp.core.Table.prototype.getAccessedVariableCode = function() {
    
    //create the text to add an accessed tables to the code
    var accessedVariableString = "";
	
	//add accessed tables, either as parent or table name
    var includedNameSet = {};
	var dependsOn = this.getDependsOn();
	for(var i = 0; i < dependsOn.length; i++) {
		var varInfo = dependsOn[i];
		
		//include the variable, or the path to it, for local references
		if((varInfo.localRefBase)&&(!includedNameSet[varInfo.localRefBase])) {
           
			//add table to access variables
			accessedVariableString += visicomp.core.util.formatString(
                visicomp.core.Table.LOCAL_ACCESSED_OBJECT_FORMAT_TEXT,
                varInfo.localRefBase
            );
              
            //store that we included this name
            includedNameSet[varInfo.localRefBase] = true;
		}
        
        //include the variable, or the path to it, for local references
		if((varInfo.rootRefBase)&&(!includedNameSet[varInfo.rootRefBase])) {
           
			//add table to access variables
			accessedVariableString += visicomp.core.util.formatString(
                visicomp.core.Table.ROOT_ACCESSED_OBJECT_FORMAT_TEXT,
                varInfo.rootRefBase
            );
              
            //store that we included this name
            includedNameSet[varInfo.localRefBase] = true;
		}
       
	}
    
    return accessedVariableString;
}



/** This is the format string to create the code body for updateing the table
 * Input indices:
 * 0: table name
 * 1: workspace name
 * 2: access variable code text
 * 3: table formula text
 * 4: supplemental code text
 */
visicomp.core.Table.TABLE_UPDATE_FORMAT_TEXT = [
"   //table update code",
"   visicomp.core.updateCode.{1}['{0}'] = function(_table) {",
"",
"       var _localPackage = _table.getPackage();",
"       var _rootPackage = _localPackage.getWorkspace().getRootPackage();",
"       var value;",
"",
"//accessed variables",
"{2}",
"//end accessed variables",
"",
"//supplemental code",
"{4}",
"//end supplemental code",
"",
"//table formula",
"{3}",
"//end formula",
"",
"       _table.setData(value);",
"   }",
""
   ].join("\n");
   
//this is the code for adding the accessed table to the code
visicomp.core.Table.LOCAL_ACCESSED_OBJECT_FORMAT_TEXT = 'var {0} = _localPackage.lookupChild("{0}").getData();\n';

//this is the code for adding the accessed package to the code
visicomp.core.Table.ROOT_ACCESSED_OBJECT_FORMAT_TEXT = 'var {0} = _rootPackage.lookupChild("{0}").getData();\n';
    


