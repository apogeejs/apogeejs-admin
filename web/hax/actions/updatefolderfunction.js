/** This namespace contains functions to process an update the object function
 *for a folderFunction. */
hax.updatefolderFunction = {};

hax.updatefolderFunction.updatePropertyValues = function(folderFunction,argList,returnValueString,recalculateList) {
    folderFunction.setArgList(argList);
    folderFunction.setReturnValueString(returnValueString);

    hax.calculation.addToRecalculateList(recalculateList,folderFunction);
}
