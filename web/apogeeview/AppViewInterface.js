/** 
 * AppViewInterface 
 * This interface has been extracted from the ModelView object in the standard UI
 * to allow for the workspace to be embedded into a web page, exposing selected
 * display views. See documentation for more information.
 * */
class AppViewInterface {

    /** This returns the underlying Apogee instance. */
    //getApp();

    /** This returns the underlying ModelManager instance. */
    //getModelManager();

    /** This looks up a component view using the component ID. This
     * may return null, such as if the component view is not in use in the
     * embedded web implementation. */
    //getComponentViewByComponentId(componentId);

    /** This looks up a component view using the member ID. This
     * may return null, such as if the component view is not in use in the
     * embedded web implementation. */
    //getComponentViewByMemberId(memberId);

    /** This indicates if Parent Views/Tab Displays are in use.  */
    //hasParentDisplays();

    /** This returns the tab frame. It should return null if tab displays are 
     * not in use.*/
    //getTabFrame();

    /** This adds the component to the UI at the base level (with no parent component).
     * This only takes an action if parent displays are in use.*/
    //addChildToRoot();

    /** This removes the component to the UI at the base level (with no parent component).
     * This only takes an action if parent displays are in use.*/
    //removeChildFromRoot();

}