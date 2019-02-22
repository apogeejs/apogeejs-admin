module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
        "options": {
            "separator": ";\n"
        },
        "base_lib": {
            "src": [
                "apogee/apogee.js",
                "apogee/lib/base.js",
                "apogee/usrlib/util.js",
                "apogee/usrlib/net.js",
                "apogee/lib/EventManager.js",
                "apogee/lib/ContextManager.js",
                "apogee/lib/codeCompiler.js",
                "apogee/lib/codeAnalysis.js",
                "apogee/lib/codeDependencies.js",
                "apogee/lib/workspaceCalculation.js",
                "apogee/lib/ActionResponse.js",
                "apogee/lib/ActionError.js",
                "apogee/datacomponents/Member.js",
                "apogee/datacomponents/ContextHolder.js",
                "apogee/datacomponents/Dependent.js",
                "apogee/datacomponents/Codeable.js",
                "apogee/datacomponents/Owner.js",
                "apogee/datacomponents/Parent.js",
                "apogee/datacomponents/RootHolder.js",
                "apogee/data/Workspace.js",
                "apogee/data/JsonTable.js",
                "apogee/data/FunctionTable.js",
				"apogee/data/JavascriptTable.js",
                "apogee/data/Folder.js",
                "apogee/data/FolderFunction.js",
                "apogee/data/ErrorTable.js",
                "apogee/actions/action.js",
                "apogee/actions/compoundaction.js",
                "apogee/actions/createmember.js",
                "apogee/actions/updateworkspace.js",
                "apogee/actions/updatemember.js",
                "apogee/actions/movemember.js",
                "apogee/actions/deletemember.js",
                "apogee/actions/updatefolderfunction.js",
                "apogee/actions/Messenger.js"
            ],
            "dest": "../../dist/lib/apogee-base-lib.js"
        },
        "base_app": {
            "src": [
                "apogeeapp/apogeeapp.js",
                "apogeeapp/ui/apogeeappui.js",
                "apogeeapp/ui/window/WindowParent.js",
                "apogeeapp/ui/window/WindowFrame.js", 
                "apogeeapp/ui/plainframe/PlainFrame.js",
                "apogeeapp/ui/tabframe/TabFrame.js",
                "apogeeapp/ui/tabframe/Tab.js",
                "apogeeapp/ui/menu/Menu.js",
                "apogeeapp/ui/menu/MenuHeader.js",
                "apogeeapp/ui/menu/MenuBody.js",
                "apogeeapp/ui/jsonedit/jsonedit.js",
                "apogeeapp/ui/jsonedit/keyentry.js",
                "apogeeapp/ui/jsonedit/valueentry.js",
                "apogeeapp/ui/jsonedit/editfield.js",
                "apogeeapp/ui/jsonedit/jsoneditarea.js",
                "apogeeapp/ui/onload/onLoadDetector.js",
                "apogeeapp/ui/displayandheader/DisplayAndHeader.js",
                "apogeeapp/ui/splitpane/SplitPane.js",
                "apogeeapp/ui/treecontrol/TreeControl.js",
                "apogeeapp/ui/treecontrol/TreeEntry.js",
                "apogeeapp/ui/configurablepanel/ConfigurablePanel.js",
                "apogeeapp/ui/configurablepanel/ConfigurableElement.js",
                "apogeeapp/ui/configurablepanel/elements/HeadingElement.js",
                "apogeeapp/ui/configurablepanel/elements/TextFieldElement.js",
                "apogeeapp/ui/configurablepanel/elements/TextareaElement.js",
                "apogeeapp/ui/configurablepanel/elements/DropdownElement.js",
                "apogeeapp/ui/configurablepanel/elements/CheckboxElement.js",
                "apogeeapp/ui/configurablepanel/elements/CheckboxGroupElement.js",
                "apogeeapp/ui/configurablepanel/elements/RadioGroupElement.js",
                "apogeeapp/ui/configurablepanel/elements/InvisibleElement.js",
                "apogeeapp/ui/configurablepanel/elements/PanelElement.js",
                "apogeeapp/ui/configurablepanel/elements/SubmitElement.js",
                "apogeeapp/ui/configurablepanel/elements/SpacerElement.js",
				"apogeeapp/ui/configurablepanel/elements/HTMLDisplayElement.js",
                "apogeeapp/app/Apogee.js",
                "apogeeapp/app/WorkspaceUI.js",
                "apogeeapp/app/BaseFileAccess.js",
                "apogeeapp/app/references/ReferenceManager.js",
                "apogeeapp/app/references/LinkEntry.js",
                "apogeeapp/app/component/WindowHeaderManager.js",
                "apogeeapp/app/component/Component.js",
                "apogeeapp/app/component/ParentComponent.js",
                "apogeeapp/app/component/EditComponent.js",
                "apogeeapp/app/component/TreeComponentDisplay.js",
                "apogeeapp/app/component/TabComponentDisplay.js",
                "apogeeapp/app/component/ParentWindowComponentDisplay.js",
                "apogeeapp/app/component/EditWindowComponentDisplay.js",
                "apogeeapp/app/components/FolderComponent.js",
                "apogeeapp/app/components/JsonTableComponent.js",
                "apogeeapp/app/components/GridTableComponent.js",
                "apogeeapp/app/components/TextComponent.js",
				"apogeeapp/app/components/JavascriptComponent.js",
                "apogeeapp/app/components/FunctionComponent.js",
                "apogeeapp/app/components/FolderFunctionComponent.js",
                "apogeeapp/app/components/BasicControlComponent.js",
                "apogeeapp/app/components/DynamicForm.js",
				"apogeeapp/app/components/FormDataComponent.js",
				"apogeeapp/app/components/CustomControlComponent.js",
                "apogeeapp/app/components/CustomComponent.js",
                "apogeeapp/app/components/CustomDataComponent.js",
                "apogeeapp/app/components/ErrorTableComponent.js",
                "apogeeapp/app/actions/errorhandling.js",
                "apogeeapp/app/actions/createworkspace.js",
                "apogeeapp/app/actions/updateworkspace.js",
                "apogeeapp/app/actions/openworkspace.js",
                "apogeeapp/app/actions/saveworkspace.js",
                "apogeeapp/app/actions/importworkspace.js",
                "apogeeapp/app/actions/exportworkspace.js",
                "apogeeapp/app/actions/closeworkspace.js",
                "apogeeapp/app/actions/addcomponent.js",
                "apogeeapp/app/actions/updatecomponent.js",
                "apogeeapp/app/actions/updatelink.js",
                "apogeeapp/app/datadisplay/ViewMode.js",
                "apogeeapp/app/datadisplay/DataDisplay.js",
                "apogeeapp/app/datadisplay/dataDisplayCallbackHelper.js",
                "apogeeapp/app/datadisplay/TextAreaEditor.js",
                "apogeeapp/app/datadisplay/AceTextEditor.js",		
                "apogeeapp/app/datadisplay/HtmlJsDataDisplay.js",
                "apogeeapp/app/datadisplay/JsonFormEditor.js",
                "apogeeapp/app/datadisplay/HandsonGridEditor.js",
                "apogeeapp/app/datadisplay/ConfigurableFormEditor.js",
                "apogeeapp/app/datadisplay/ConfigurableFormDisplay.js",
                "apogeeapp/app/datadisplay/ErrorDisplay.js",
                "apogeeapp/app/dialogs/ConfigurableDialog.js",
                "apogeeapp/app/dialogs/SelectControlDialog.js",
            ],
            "dest": "../../dist/lib/apogee-base-app.js"
        },
        "dist_web_lib": {
            "options":{
                "banner":"/* Apogee Web Lib Version <%= pkg.version %> */\n"
            },
            "src": [
                "supplemental/webLibPackHeader.js",
                "supplemental/webLibHeader.js",
                "../../dist/lib/apogee-base-lib.js",
                "supplemental/webLibPackFooter.js",
            ],
            "dest": "../../dist/lib/apogee-web-lib.js"
        },
        "dist_web_app": {
            "options":{
                "banner":"/* Apogee Web App Version <%= pkg.version %> */\n"
            },
            "src": [
                "supplemental/webAppPackHeader.js",
                "../../dist/lib/apogee-base-app.js",
                "supplemental/cutNPasteCode/CutNPasteFileAccess.js",
                "supplemental/cutNPasteCode/TextIoDialog.js",
                "supplemental/webAppPackFooter.js"
            ],
            "dest": "../../dist/lib/apogee-web-app.js"
        },
        "dist_npm_lib": {
            "options":{
                "banner":"/* Apogee NPM Lib Version <%= pkg.version %> */\n"
            },
            "src": [
                "supplemental/npmLibHeader.js",
                "../../dist/lib/apogee-base-lib.js",
                "supplemental/npmLibFooter.js"
            ],
            "dest": "../../dist/lib/apogee-npm-lib.js"
        },
        "dist_npm_app": {
            "options":{
                "banner":"/* Apogee NPM App Version <%= pkg.version %> */\n"
            },
            "src": [
                "supplemental/npmAppHeader.js",
                "../../dist/lib/apogee-base-app.js",
                "supplemental/electronCode/custom_menus_electron.js",
                "supplemental/electronCode/ElectronFileAccess.js",
                "supplemental/npmAppFooter.js"
            ],
            "dest": "../../dist/lib/apogee-npm-app.js"
        }
    },
    uglify: {
      options: {
        banner: '/*! apogee <%= pkg.version %> */\n'
      },
      dist_web_lib: {
        files: {
          '../../dist/lib/apogee-web-lib.min.js': ['<%= concat.dist_web_lib.dest %>']
        }
      },
      dist_web_app: {
        files: {
          '../../dist/lib/apogee-web-app.min.js': ['<%= concat.dist_web_app.dest %>']
        }
      },
	  dist_npm_lib: {
        files: {
          '../../dist/lib/apogee-npm-lib.min.js': ['<%= concat.dist_npm_lib.dest %>']
        }
      },
	  dist_npm_app: {
        files: {
          '../../dist/lib/apogee-npm-app.min.js': ['<%= concat.dist_npm_app.dest %>']
        }
      }
    },
    concat_css: {
        options: {
          banner: '/*! apogee <%= pkg.version %> */\n' 
        },
        all: {
          src: [
            "apogeeapp/ui/jsonedit/jsonedit.css",
            "apogeeapp/ui/window/WindowFrame.css",
            "apogeeapp/ui/window/dialog.css",
            "apogeeapp/ui/displayandheader/DisplayAndHeader.css",
            "apogeeapp/ui/menu/Menu.css",
            "apogeeapp/ui/splitpane/SplitPane.css",
            "apogeeapp/ui/tabframe/TabFrame.css",
            "apogeeapp/ui/treecontrol/TreeControl.css",
            "apogeeapp/ui/configurablepanel/ConfigurablePanel.css"
          ],
          dest: "../../dist/lib/apogeeui.css"
        },
      },
    copy: {
      main: {
        files: [

          //construct app speckfic directories
          
          //web cutnpaste
          {src: 'supplemental/debugHook.js', dest: '../../dist/web-dist/v<%= pkg.version %>/debugHook.js'},
          {expand: true, flatten: true, src: ['supplemental/cutNPasteCode/app/*'], dest: '../../dist/web-dist/v<%= pkg.version %>/', filter: 'isFile'},
          {src: '../../dist/lib/apogee-web-lib.js', dest: '../../dist/web-dist/v<%= pkg.version %>/apogee-web-lib.js'},
          {src: '../../dist/lib/apogee-web-lib.min.js', dest: '../../dist/web-dist/v<%= pkg.version %>/apogee-web-lib.min.js'},
          {src: '../../dist/lib/apogee-web-app.js', dest: '../../dist/web-dist/v<%= pkg.version %>/apogee-web-app.js'},
          {src: '../../dist/lib/apogee-web-app.min.js', dest: '../../dist/web-dist/v<%= pkg.version %>/apogee-web-app.min.js'},
          {src: 'apogeeapp/app/apogeeapp.css', dest: '../../dist/web-dist/v<%= pkg.version %>/apogeeapp.css'},
          {src: '../../dist/lib/apogeeui.css', dest: '../../dist/web-dist/v<%= pkg.version %>/apogeeui.css'},
          {expand: true, flatten: false, src: ['resources/**'], dest: '../../dist/web-dist/v<%= pkg.version %>/'},
          {expand: true, flatten: false, src: ['lib/**'], dest: '../../dist/web-dist/v<%= pkg.version %>/'},
          
          //electron
          {src: 'supplemental/debugHook.js', dest: '../../dist/electron-dist/ApogeeJS_v<%= pkg.version %>/debugHook.js'},
          {expand: true, flatten: true, src: ['supplemental/electronCode/app/*'], dest: '../../dist/electron-dist/ApogeeJS_v<%= pkg.version %>/', filter: 'isFile'},
          {src: '../../dist/lib/apogee-npm-lib.js', dest: '../../dist/electron-dist/ApogeeJS_v<%= pkg.version %>/apogee-npm-lib.js'},
          {src: '../../dist/lib/apogee-npm-app.js', dest: '../../dist/electron-dist/ApogeeJS_v<%= pkg.version %>/apogee-npm-app.js'},
          {src: 'apogeeapp/app/apogeeapp.css', dest: '../../dist/electron-dist/ApogeeJS_v<%= pkg.version %>/apogeeapp.css'},
          {src: '../../dist/lib/apogeeui.css', dest: '../../dist/electron-dist/ApogeeJS_v<%= pkg.version %>/apogeeui.css'},
          {expand: true, flatten: false, src: ['resources/**'], dest: '../../dist/electron-dist/ApogeeJS_v<%= pkg.version %>/'},
          
          
          

        ],
      }
    },
    jsdoc: {
        dist: {
            "src": ["apogee/*.js","apogee/usrlib/*.js"]
        },
        options: {
            destination: '../../dist/docs/v<%= pkg.version %>/userLibDocs',
            XXXtemplate : "node_modules/ink-docstrap/template",
            configure : "jsdoc.conf.json"
        }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-concat-css');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('default', ['concat', 'concat_css', 'uglify', 'copy', 'jsdoc']);

};
