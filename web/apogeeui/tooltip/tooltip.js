import uiutil from "/apogeeui/uiutil.js";

 /** This  */
export function wrapWithTooltip(contentElement,tooltipText) {
    let tooltipWrapper = document.createElement("div");
    tooltipWrapper.className = "apogee_tooltip_element";
    let tooltip = document.createElement("div");
    tooltip.className = "apogee_tooltip_text";
    tooltip.innerHTML = tooltipText;
    tooltipWrapper.appendChild(contentElement);
    tooltipWrapper.appendChild(tooltip);
    return {wrapperElement: tooltipWrapper, tooltipElement: tooltip};
}

export function getHelpElement(helpText) {
    let helpIconUrl = uiutil.getResourcePath(HELP_ICON_PATH);
    let helpImgElement = document.createElement("img");
    helpImgElement.src = helpIconUrl;
    let elements = wrapWithTooltip(helpImgElement,helpText);
    elements.imgElement = helpImgElement;
    return elements;
}

const HELP_ICON_PATH = "/helpIcon_darkGray.png"; 