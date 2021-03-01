#Apogee

Apogee is a javascript programming environment for iterative programming. For more information go to http://www.apogeejs.com.

Apogee currently has 5 different applications, which are split into different repositories.

1. __Apogee Web Application__ - This is the basic apogee programming environment running in a web browser. _repo: apogeejs-web-app_
2. __Apogee Web Runtime__ - This is a library that allows to embed the functionality of an Apogee workspace into a web page. _repo: apogeejs-web-runtime_
3. __Apogee Electron__, "web" version - This is a version of the basic apogee programming environment running in electron. It is otherwise identical to the Apogee web application in that the user does not have access to node commands. Any workspace that runs in the web app should also run here. Operationally the difference is that this version has access to the local computers file system. (For security, the user will be notified of any attempt to save to the file system.) _repo: apogeejs-electron-web_
4. __Apogee Electron, "node" version__ - This is also a version of the basic Apogee programming environment running in electron. However in this version the user has access to "require" and to all Node commands, such as file system access. This is intended to go along with the Apogee Server, which will also have access to all Node commands. _repo: apogeejs-electron-node_
5. __Apogee Server__ - This is a Node server which uses Apogee workspaces to create web services. To accompany this server, the Apogee Electron Node version of Apogee should be used. _repo: apogeejs-server_

Additionally there are multiple internal libraries in other repos. _More details will come on settting up the build system._

(NOTE - this repo was formerly a large repo that has been broken out into multiple libraries versioning of the different applications.
