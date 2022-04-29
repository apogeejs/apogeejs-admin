/** TabView 
* TabObject functions:
* - int/string getId() - a unique id for the tab object
* - string getName() - the name for the tab
* - element getTabElement() - Returns the tab content element
*/

const INVALID_TAB_ID = 0

function TabView({tabObjects, selectedTabId, closeTab, selectTab}) {

    return (
        <div className="tabView">
            <div className="tabView_head">
                {tabObjects.map(tabObject => TabTab({
                        tabObject, 
                        closeTab, 
                        selectTab, 
                        selected: selectedTabId == tabObject.getId()
                    }))}
            </div>
            <div className="tabView_body">
                {tabObjects.map(tabObject => TabFrame({
                    tabObject,
                    selected: selectedTabId == tabObject.getId()
                }))}
            </div>
        </div>
    )
}

function TabTab({tabObject, closeTab, selectTab, selected}) {
    function closeClicked(event) {
        closeTab(tabObject)
        event.stopPropagation() //prevent click from going to tab
    }

    function tabClicked(event) {
        selectTab(tabObject)
        event.stopPropagation()
    }

    let className = "tabView_tab " + (selected ? "tabView_selected" : "tabView_deselected")

    return (
        <div key={tabObject.getId()} onClick={tabClicked} className={className}>
            <span>{tabObject.getName()}</span>
            <img onClick={closeClicked} src="resources/close_gray.png"/>    
        </div>
    )
}

function TabFrame({tabObject, selected}) {
    return (
        <div key={tabObject.getId()} style={{display: selected ? '' : "none"}} className="tabView_frame">{tabObject.getTabElement()}</div>
    )
}