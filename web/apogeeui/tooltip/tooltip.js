import uiutil from "/apogeeui/uiutil.js";

 /** This  */
export function wrapWithTooltip(contentElement,text,options) {
    let tooltipWrapper = document.createElement("div");
    tooltipWrapper.className = "apogee_tooltip_element";
    let tooltipText = document.createElement("div");
    tooltipText.className = "apogee_tooltip_text";
    tooltipText.innerHTML = text;
    tooltipWrapper.appendChild(contentElement);
    tooltipWrapper.appendChild(tooltipText);

    //add options
    if(options.wrapperAddonClass) tooltipWrapper.classList.add(options.wrapperAddonClass);
    if(options.textAddonClass) tooltipText.classList.add(options.textAddonClass);
    if(options.textWidth) tooltipText.style.width = options.textWidth;

    return {wrapperElement: tooltipWrapper, textElement: tooltipText};
}

export function getHelpElement(helpText,options) {
    let helpIconUrl = uiutil.getResourcePath(HELP_ICON_PATH);
    let helpImgElement = document.createElement("img");
    helpImgElement.src = helpIconUrl;
    let elements = wrapWithTooltip(helpImgElement,helpText,options);
    elements.imgElement = helpImgElement;
    return elements;
}

const HELP_ICON_PATH = "/helpIcon_darkGray.png"; 