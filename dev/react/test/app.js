///////////////////////////////////////////
//Application
///////////////////////////////////////////

const INVALID_ID = 0


///////////////////////////////////////////////
//UI
///////////////////////////////////////////////
function App({appObject}) {
    //Tab State
    //tab data = {text,contentElement,closeOkCallback}
    const [tabObjects,setTabObjects] = React.useState([])
    const [selectedTabId,setSelectedTabId] = React.useState(INVALID_TAB_ID)   //0 is invalid tab id

    function openTab(tabObject,isSelected = true) {
        //open if not already there
        if(tabObjects.find(existingTabObject => tabObject.getId() == existingTabObject.getId()) === undefined) {
            //notify open??? (probabl not necessary)
            setTabObjects(tabObjects.concat(tabObject))
        }
        //select if specified
        if(isSelected) selectTab(tabObject)
    }

    function selectTab(tabObject) {
        //need notify show and hide!!!
        if(tabObject) {
            setSelectedTabId(tabObject.getId())
        }
        else {
            setSelectedTabId(INVALID_ID)
        }
    }

    function closeTab(tabObject) {
        if( tabObject.closeTabOk && !tabObject.closeTabOk() ) {
            //we need some action here presumably
            return
        }

        //notify close??? (I am not sure if this is the place for it)
        let newTabItems = tabObjects.filter(existingTabObject => existingTabObject.getId() != tabObject.getId())
        if(tabObject.getId() == selectedTabId) {
            if(newTabItems.length > 0) { //if we close the active tab, make the first tab active
                selectTab(newTabItems[0])
            }
            else {
                selectTab(null)
            }
        }
        setTabObjects(newTabItems)
    }

    return (
        <>
            <MenuBar appObject={appObject} />
            <SplitFrame
                leftContent={<TreeView treeObject={appObject} openTab={openTab}/>}
                rightContent={<TabView tabObjects={tabObjects} selectedTabId={selectedTabId} closeTab={closeTab} selectTab={selectTab}/>} 
            />
        </>
    )
}

function MenuBar({appObject}) {
    return (
        <div className="appMenuBar">
            {appObject.getMenuItems().map(menuItem => <SelectMenu key={menuItem.text} text={menuItem.text} items={menuItem.items}/>)}
        </div>
    )
}