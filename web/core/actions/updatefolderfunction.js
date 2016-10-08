/** This namespace contains functions to process an update the object function
 *for a folderFunction. */
hax.core.updatefolderFunction = {};

hax.core.updatefolderFunction.updatePropertyValues = function(folderFunction,argList,returnValueString,recalculateList) {
    folderFunction.setArgList(argList);
    folderFunction.setReturnValueString(returnValueString);

    hax.core.calculation.addToRecalculateList(recalculateList,folderFunction);
}
