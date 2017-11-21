
/** This class manages links for CSS and JS for the page. When links are added
 * they should be associated with an owner identified with a name. A given link
 * will be removed when all owners of that link on longer use it.
 * (This implementation was used when we had multiple workspaces allowed in the
 * application.
 * . */
apogeeapp.app.LinkManager = function() {
	//external links infrastructure
	this.linkMap = {};
}

/** This method adds links as registered by a given owner, as identified by name.
 * Links can be added and removed. Removing links may or may not remove them from the page (currently
 * js links are not removed and css links are, once they are not used by any 
 * owner. The linksLoadedCallback is optional. It is called when all links have
 * been loaded on the page.
 * The arguments "addList" and"removeList" are arrays with the entries {"link":(url),"type":("js" or "css")}
 */
apogeeapp.app.LinkManager.prototype.updateWorkspaceLinks = function(ownerName,addList,removeList,linksLoadedCallback) {
	
	var i;
	var cnt;
	var index;
	var linkObject;
	var link;
	var type;
	var linkWorkspaces;
	
	//remove the workspace for this link
	cnt = removeList.length;
	for(i = 0; i < cnt; i++) {
		linkObject = removeList[i];
		link = linkObject.link;
		type = linkObject.type;
		linkWorkspaces = this.linkMap[link];
		if(linkWorkspaces) {
			index = linkWorkspaces.indexOf(link);
			if(index !== -1) {
				//remove the workspace from this link
				linkWorkspaces.splice(i,1);
				if(linkWorkspaces.length === 0) {
					//nobody references this link
					//try to remove it (it might not be removeable
					var linkRemoved = this.removeLinkFromPage(link,type);
					if(linkRemoved) {
						delete this.linkMap[link];
					}
				}
			}
			else {
				//workspace already removed - no action
			}
		}
		else {
			//link does not exist - no action
		}
	}
	
	//this object will call the cllback when all links are loaded
	var responseProcessor;
	if(linksLoadedCallback) {
		responseProcessor = this.getResponseProcessor(addList,linksLoadedCallback);
	}
	
	//add links
	cnt = addList.length;
    if(cnt === 0) {
		//make sure we still return if there is nothing to add
		if(linksLoadedCallback) linksLoadedCallback();
	}
	else {
        for(i = 0; i < cnt; i++) {
            linkObject = addList[i];
            link = linkObject.link;
            type = linkObject.type;
            linkWorkspaces = this.linkMap[link];
            if(linkWorkspaces) {
                //link already present on page
                index = linkWorkspaces.indexOf(link);
                if(index != -1) {
                    //workspace already has link - no action
                }
                else {
                    //add workspace to link
                    linkWorkspaces.push(ownerName);
                }

    //SLOPPY!
                //not pending
                if(responseProcessor) {
                    responseProcessor.getOnLoad(link)();
                }
            }
            else {
                //link must be added, and workspace added to link
                linkWorkspaces = [];
                linkWorkspaces.push(ownerName);
                this.linkMap[link] = linkWorkspaces;
                this.addLinkToPage(link,type,responseProcessor);
            }
        }
    }
}

apogeeapp.app.LinkManager.prototype.addLinkToPage = function(link,type,responseProcessor) {
	
	if(type === "js") {
		apogeeapp.app.LinkManager.addJsLink(link,responseProcessor)
	}
	else if(type === "css") {
		apogeeapp.app.LinkManager.addCssLink(link,responseProcessor);
	}
}

apogeeapp.app.LinkManager.prototype.removeLinkFromPage = function(link,type) {
	//for now do not remove js link, only css
	//we can not unexectue the js script
	//css does get removed
	if(type === "css") {
		apogeeapp.app.LinkManager.removeLink(link);
		return true;
	}
	else {
		return false;
	}
}

/** @private */
apogeeapp.app.LinkManager.addJsLink = function(link,responseProcessor) {

    //set the link as the element id
    var element = document.getElementById(link);
    if(!element) {
		//create link properties
		var linkProps = {};
		linkProps.id = link;
		linkProps.src = link;
		if(responseProcessor) {
			linkProps.onload = responseProcessor.getOnLoad(link);
			linkProps.onerror = responseProcessor.getOnError(link);
		}
        element = apogeeapp.ui.createElement("script",linkProps);
        document.head.appendChild(element);
    }
	else {
		alert("THIS SHOULDN'T HAPPEN!");
	}
}

/** @private */
apogeeapp.app.LinkManager.addCssLink = function(link,onResponseProcessor) {
    //set the link as the element id
    var element = document.getElementById(link);
    if(!element) {
		//create link properties
		var linkProps = {};
		linkProps.id = link;
		linkProps.rel = "stylesheet";
		linkProps.type = "text/css";
		linkProps.href = link;
		if(onResponseProcessor) {
			linkProps.onload = onResponseProcessor.getOnLoad(link);
			linkProps.onerror = onResponseProcessor.getOnError(link);
		}
        element = apogeeapp.ui.createElement("link",linkProps);
        document.head.appendChild(element);
    }
	else {
		alert("THIS SHOULDN'T HAPPEN!");
	}
}

/** @private */
apogeeapp.app.LinkManager.removeLink = function(link) {
    //set the link as the element id
    var element = document.getElementById(link);
    if(element) {
        document.head.removeChild(element);
    }
}

/** This returns an object that manages calling the given callback when all requested links
 * are loaded.
 * @private */
apogeeapp.app.LinkManager.prototype.getResponseProcessor = function(addList,linksLoadedCallback) {
	var links = [];
	for(var i = 0; i < addList.length; i++) {
		links[i] = addList[i].link;
	}

	var checkList = function(link) {
		var index = links.indexOf(link);
		if(index >= 0) {
			links.splice(index,1);
		}
		if(links.length === 0) {
			linksLoadedCallback();
		}
	}

	var responseProcessor = {};
	responseProcessor.getOnLoad = function(link) {
		return function() {
			console.log("link loaded: " + link);
			checkList(link);
		}
	}
	responseProcessor.getOnError = function(link) {
		return function() {
			console.log("link not loaded: " + link);
			checkList(link);
			alert("Error loading link: " + link);
		}
	}

	return responseProcessor;
}



