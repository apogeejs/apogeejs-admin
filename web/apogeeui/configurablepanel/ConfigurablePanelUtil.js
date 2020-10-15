
/** This function takes a configurable form value and converts it to a function body that
 * allows for expressions to be entered into the form. Definition of what is an expression versus
 * a simple value is done in the "meta" field of the form config. */
export function getFormResultFunctionBody(formValue,formMeta) {
    let parentObjectName = "output";
    let functionLines = [];
    functionLines.push("let output = {};");

    //load the converted data
    _loadPanelLines(parentObjectName,formValue,formMeta,functionLines);

    functionLines.push("return output;")
    return functionLines.join("\n");
}

/** This loads a value to an assignee, as part of the form result function body. */
function _loadEntry(assigneeName,value,meta,functionLines) {
    if((value === undefined)||(value === null)||((meta)&&(meta.excludeValue !== undefined)&&(meta.excludeValue === value))) {
        //value excluded
        //handle value === undefined!!
        return false;
    }
        
    //add value
    if((meta)&&(meta.expression)) {
        //expression
        switch(meta.expression) {
            case "simple":
                return _loadSimpleExpressionEntry(assigneeName,value,functionLines);
                
            case "object":
                functionLines.push(assigneeName + "= {};");
                _loadPanelLines(assigneeName,value,meta.childMeta,functionLines);
                //for now we always add the base object, even if empty
                return true;
                
            case "array": 
                functionLines.push(assigneeName + "= []");
                if(meta.childMeta) {
                    _loadMultiTypedArrayLines(assigneeName,value,meta.childMeta,functionLines);
                }
                else if(meta.entryMeta) {
                    _loadSingleTypedArrayLines(assigneeName,value,meta.entryMeta,functionLines);
                }
                //for now we always add the base array, even if empty
                return true;
                
            default:
                console.error("Expression type not supported: " + meta.expression);
                return false;
        }
    }
    else {
        //plain value, not an expression
        return _loadSimpleValueEntry(assigneeName,value,functionLines);
    }
}

/** This loads a value to an assignee for a simple value, as part of the form result function body. */
function _loadSimpleValueEntry(assigneeName,value,functionLines) {
    let line = assigneeName + " = " + JSON.stringify(value);
    functionLines.push(line);
    return true;
}

/** This loads a value to an assignee for a simple expression, as part of the form result function body. */
function _loadSimpleExpressionEntry(assigneeName,value,functionLines) {
    let trimmedValue = value.toString().trim();
    if(trimmedValue === "") return false;
    
    let line = assigneeName + " = " + trimmedValue;
    functionLines.push(line);
    return true;
}

/** This loads a value to an assignee fpr a panel, as part of the form result function body. */
function _loadPanelLines(parentObjectName,panelValue,panelMeta,functionLines) {
    for(let key in panelValue) {
        let meta = panelMeta[key];
        let value = panelValue[key];
        let assigneeName = parentObjectName + "[" + JSON.stringify(key) + "]";
        _loadEntry(assigneeName,value,meta,functionLines);
    }
}

/** This loads a value to an assignee for a multi-typed list, as part of the form result function body. */
function _loadMultiTypedArrayLines(assigneeName,value,metaMap,functionLines) {
    let insertIndex = 0;
    let linesAdded = false;
    value.forEach( (keyedEntry) => {
        let key = keyedEntry.key;
        let entryValue = keyedEntry.value;
        let entryMeta = metaMap[key];
        let entryAssigneeName = assigneeName + "[" + insertIndex + "]";
        let lineAdded = _loadEntry(entryAssigneeName,entryValue,entryMeta,functionLines);
        if(lineAdded) {
            insertIndex++;
            linesAdded = true;
        }
    });
    return linesAdded;
}

/** This loads a value to an assignee for a single-typed list, as part of the form result function body. */
function _loadSingleTypedArrayLines(assigneeName,value,entryMeta,functionLines) {
    let insertIndex = 0;
    let linesAdded = false;
    value.forEach( (entryValue) => {
        let entryAssigneeName = assigneeName + "[" + insertIndex + "]";
        let lineAdded = _loadEntry(entryAssigneeName,entryValue,entryMeta,functionLines);
        if(lineAdded) {
            insertIndex++;
            linesAdded = true;
        }
    });
    return linesAdded;
}