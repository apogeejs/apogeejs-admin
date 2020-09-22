import uiutil from "/apogeeui/uiutil.js";

 /** This function wraps a given content element so it has a tooltip. 
  * Argments:
  * - contentElement - the DOM element to wrap
  * - text - the tooltip text
  * - options - an object with these possible keys, all optional:
  * -- wrapperAddonClass - This is a class to add to the wrapper element, such as to modify positioning
  * -- textAddonClass - This is a class to add to the text element
  * -- textWidth - This allows the user to set the desired width of the text element. 
  * Return Value:
  * An object with the following keys:
  * - wrapperElement - The outside element
  * - textElement - the text element. This is returned to allow modification if desired.
  */
export function wrapWithTooltip(contentElement,text,options) {
    let tooltipWrapper = document.createElement("div");
    tooltipWrapper.className = "apogee_tooltip_element";
    let tooltipText = document.createElement("div");
    tooltipText.className = "apogee_tooltip_text";
    tooltipText.innerHTML = text;
    tooltipWrapper.appendChild(contentElement);
    tooltipWrapper.appendChild(tooltipText);

    //add options
    if(options) {
        if(options.wrapperAddonClass) tooltipWrapper.classList.add(options.wrapperAddonClass);
        if(options.textAddonClass) tooltipText.classList.add(options.textAddonClass);
        if(options.textWidth) tooltipText.style.width = options.textWidth;
    }

    return {wrapperElement: tooltipWrapper, textElement: tooltipText};
}

 /** This function creates a help image with a tooltip.  
  * Argments:
  * - text - the help text
  * - options - These are the same options as in the function wrapWithTooltip 
  * Return Value:
  * An object with the following keys:
  * - wrapperElement - The outside element
  * - textElement - the text element. This is returned to allow modification if desired.
  * - imgElement - the 'help' image element
  */
export function getHelpElement(helpText,options) {
    let helpIconUrl = uiutil.getResourcePath(HELP_ICON_PATH);
    let helpImgElement = document.createElement("img");
    helpImgElement.src = helpIconUrl;
    let elements = wrapWithTooltip(helpImgElement,helpText,options);
    elements.imgElement = helpImgElement;
    return elements;
}

const HELP_ICON_PATH = "/helpIcon_darkGray.png"; 