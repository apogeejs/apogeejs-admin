
/* Tree View 
* Creates a tree from a TreeObject. TreeObject interface:
* - boolean hasChildren() - returns true if there are 0 children
* - [TreeObject] getChildren() - returns a list of children.
* - boolean hasMenu() - returns true if the tree entry has a menu
* - boolean getMenuItems() - returns the menu items for the menu
* - boolean hasTab() - returns true if the entry has a tab item
* TO CLEAN UP
* - click name action!
* - add open parent action (as in for child components)
*/
function TreeView({treeObject, openTab}) {
    return (
        <ul className="treeView_list">
            {treeObject.getChildren().map(childObject => <TreeEntry key={childObject.getId()} treeObject={childObject} openTab={openTab} />)}
        </ul>
    )
}

function TreeEntry({treeObject, openTab}) {
    const [opened,setOpened] = React.useState(false);
    let controlImage = treeObject.hasChildren() ? (opened ? "resources/opened_gray.png" : "resources/closed_gray.png") : "resources/circle_gray.png"

    function controlClicked() {
        if(treeObject.hasChildren()) {
            setOpened(!opened)
        }
    }

    function getMenu(treeObject) {
        if(treeObject.hasMenu() || treeObject.hasTab()) {
            let objectMenuItems = treeObject.hasMenu() ? treeObject.getMenuItems() : []
            let appMenuItems = treeObject.hasTab() ? [{text: "Open", action: () => openTab(treeObject)}] : []
            return <SelectMenu text="Menu" image="resources/menuDots16_gray.png" items={[...appMenuItems, ...objectMenuItems]} />
        }
        else {
            return ''
        }
    }

    return (
        <li className="treeView_item">
            <img src={controlImage} onClick={controlClicked} className="workspaceTree_control"/>
            <IconWithStatus iconObject={treeObject} />
            <span>{treeObject.getName()}</span>
            {getMenu(treeObject)}
            { (opened && treeObject.hasChildren()) ? <TreeView treeObject={treeObject} openTab={openTab}/> : ''}
        </li>
    )
}
