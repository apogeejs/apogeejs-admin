/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

this.appConfigManager.getConfigPromise()
this.appConfigManager.getFileAccessObject();
this.appConfigManager.getInitialWorkspaceFilePromise();
this.appConfigManager.getInitialWorkspaceMetadata();


    /////////////////////////////
    
    //open a workspace if there is a url present
    var workspaceUrl = apogee.util.readQueryField("url",document.URL);
    var workspaceTextPromise = apogee.net.textRequest(workspaceUrl);