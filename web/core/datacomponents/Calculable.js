/** This mixin encapsulates an object in the workspace that is calculable.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A Calculable must be a Child. The Child component must be installed before the
 * Calculable component.
 * 
 * - A Calculable is typically a codeable, with the calculation being defined by he code.
 */
visicomp.core.Calculable = {};

/** This initializes the component */
visicomp.core.Calculable.init = function() {
    //errors before calculation is attempted
    this.preCalcErrors = [];
}

/** This property tells if this object is calculable.
 * This property should not be implemented on non-calculables. */
visicomp.core.Calculable.isCalculable = true;

/** This method sets the pre calc error for this dependent. */
visicomp.core.Calculable.addPreCalcError = function(preCalcError) {
    var entry = {};
    entry.type = preCalcError.getType();
    entry.error = preCalcError;
    this.preCalcErrors.push(entry);
}

/** This method clears the pre calc error of a given type. It no type is set
 * all errors are cleared.*/
visicomp.core.Calculable.clearPreCalcErrors = function(type) {
    var newList = [];
    if(type != null) {    
        for(var i = 0; i < this.preCalcErrors.length; i++) {
            var entry = this.preCalcErrors[i];
            if(entry.type != type) {
                newList.push(entry);
            }
        }
    }
    this.preCalcErrors = newList;
}

/** This returns true if there is a pre calc error. */
visicomp.core.Calculable.hasPreCalcError = function() {
    return (this.preCalcErrors.length > 0);
}

/** This returns the pre calc error. */
visicomp.core.Calculable.getPreCalcErrors = function() {
    return this.preCalcErrors;
}

///** This is a check to see if the object should be checked for dependencies 
// * for recalculation.  
// * @private */
//visicomp.core.Calculable.needsCalculating = function();


///** This updates the member based on a change in a dependency.  */
//visicomp.core.Calculable.calculate = function();



