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
                "apogeeui/apogeeappui.js",
                "apogeeui/window/WindowParent.js",
                "apogeeui/window/WindowFrame.js", 
                "apogeeui/plainframe/PlainFrame.js",
                "apogeeui/tabframe/TabFrame.js",
                "apogeeui/tabframe/Tab.js",
                "apogeeui/menu/Menu.js",
                "apogeeui/menu/MenuHeader.js",
                "apogeeui/menu/MenuBody.js",
                "apogeeui/jsonedit/jsonedit.js",
                "apogeeui/jsonedit/keyentry.js",
                "apogeeui/jsonedit/valueentry.js",
                "apogeeui/jsonedit/editfield.js",
                "apogeeui/jsonedit/jsoneditarea.js",
                "apogeeui/onload/onLoadDetector.js",
                "apogeeui/displayandheader/DisplayAndHeader.js",
                "apogeeui/splitpane/SplitPane.js",
                "apogeeui/treecontrol/TreeControl.js",
                "apogeeui/treecontrol/TreeEntry.js",
                "apogeeui/configurablepanel/ConfigurablePanel.js",
                "apogeeui/configurablepanel/ConfigurableElement.js",
                "apogeeui/configurablepanel/elements/HeadingElement.js",
                "apogeeui/configurablepanel/elements/TextFieldElement.js",
                "apogeeui/configurablepanel/elements/TextareaElement.js",
                "apogeeui/configurablepanel/elements/DropdownElement.js",
                "apogeeui/configurablepanel/elements/CheckboxElement.js",
                "apogeeui/configurablepanel/elements/CheckboxGroupElement.js",
                "apogeeui/configurablepanel/elements/RadioGroupElement.js",
                "apogeeui/configurablepanel/elements/InvisibleElement.js",
                "apogeeui/configurablepanel/elements/PanelElement.js",
                "apogeeui/configurablepanel/elements/SubmitElement.js",
                "apogeeui/configurablepanel/elements/SpacerElement.js",
				"apogeeui/configurablepanel/elements/HTMLDisplayElement.js",
                "apogeeapp/Apogee.js",
                "apogeeapp/WorkspaceManager.js",
                "apogeeapp/BaseFileAccess.js",
                "apogeeapp/references/ReferenceManager.js",
                "apogeeapp/references/LinkEntry.js",
                "apogeeapp/component/WindowHeaderManager.js",
                "apogeeapp/component/Component.js",
                "apogeeapp/component/ParentComponent.js",
                "apogeeapp/component/EditComponent.js",
                "apogeeview/componentdisplay/TreeComponentDisplay.js",
                "apogeeapp/component/TabComponentDisplay.js",
                "apogeeapp/component/ParentWindowComponentDisplay.js",
                "apogeeapp/component/EditWindowComponentDisplay.js",
                "apogeeapp/components/FolderComponent.js",
                "apogeeapp/components/JsonTableComponent.js",
                "apogeeapp/components/GridTableComponent.js",
                "apogeeapp/components/TextComponent.js",
                "apogeeapp/components/FunctionComponent.js",
                "apogeeapp/components/FolderFunctionComponent.js",
                "apogeeapp/components/BasicControlComponent.js",
                "apogeeapp/components/DynamicForm.js",
				"apogeeapp/components/FormDataComponent.js",
				"apogeeapp/components/CustomControlComponent.js",
                "apogeeapp/components/CustomComponent.js",
                "apogeeapp/components/CustomDataComponent.js",
                "apogeeapp/components/ErrorTableComponent.js",
                "apogeeapp/actions/errorhandling.js",
                "apogeeapp/actions/createworkspace.js",
                "apogeeapp/actions/updateworkspace.js",
                "apogeeapp/actions/openworkspace.js",
                "apogeeapp/actions/saveworkspace.js",
                "apogeeapp/actions/importworkspace.js",
                "apogeeapp/actions/exportworkspace.js",
                "apogeeapp/actions/closeworkspace.js",
                "apogeeapp/actions/addcomponent.js",
                "apogeeapp/actions/updatecomponent.js",
                "apogeeapp/actions/updatelink.js",
                "apogeeview/datadisplay/ViewMode.js",
                "apogeeview/datadisplay/DataDisplay.js",
                "apogeeview/datadisplay/dataDisplayCallbackHelper.js",
                "apogeeview/datadisplay/TextAreaEditor.js",
                "apogeeview/datadisplay/AceTextEditor.js",		
                "apogeeview/datadisplay/HtmlJsDataDisplay.js",
                "apogeeview/datadisplay/JsonFormEditor.js",
                "apogeeview/datadisplay/HandsonGridEditor.js",
                "apogeeview/datadisplay/ConfigurableFormEditor.js",
                "apogeeview/datadisplay/ConfigurableFormDisplay.js",
                "apogeeview/datadisplay/ErrorDisplay.js",
                "apogeeview/dialogs/ConfigurableDialog.js",
                "apogeeview/dialogs/SelectControlDialog.js",
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
            "apogeeui/jsonedit/jsonedit.css",
            "apogeeui/window/WindowFrame.css",
            "apogeeui/window/dialog.css",
            "apogeeui/displayandheader/DisplayAndHeader.css",
            "apogeeui/menu/Menu.css",
            "apogeeui/splitpane/SplitPane.css",
            "apogeeui/tabframe/TabFrame.css",
            "apogeeui/treecontrol/TreeControl.css",
            "apogeeui/configurablepanel/ConfigurablePanel.css"
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
          {src: 'apogeeview/apogeeapp.css', dest: '../../dist/web-dist/v<%= pkg.version %>/apogeeapp.css'},
          {src: '../../dist/lib/apogeeui.css', dest: '../../dist/web-dist/v<%= pkg.version %>/apogeeui.css'},
          {expand: true, flatten: false, src: ['resources/**'], dest: '../../dist/web-dist/v<%= pkg.version %>/'},
          {expand: true, flatten: false, src: ['lib/**'], dest: '../../dist/web-dist/v<%= pkg.version %>/'},
          
          //electron
          {src: 'supplemental/debugHook.js', dest: '../../dist/electron-dist/ApogeeJS_v<%= pkg.version %>/debugHook.js'},
          {expand: true, flatten: true, src: ['supplemental/electronCode/app/*'], dest: '../../dist/electron-dist/ApogeeJS_v<%= pkg.version %>/', filter: 'isFile'},
          {src: '../../dist/lib/apogee-npm-lib.js', dest: '../../dist/electron-dist/ApogeeJS_v<%= pkg.version %>/apogee-npm-lib.js'},
          {src: '../../dist/lib/apogee-npm-app.js', dest: '../../dist/electron-dist/ApogeeJS_v<%= pkg.version %>/apogee-npm-app.js'},
          {src: 'apogeeview/apogeeapp.css', dest: '../../dist/electron-dist/ApogeeJS_v<%= pkg.version %>/apogeeapp.css'},
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
