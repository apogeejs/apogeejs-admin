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
                "apogeeapp/app/Apogee.js",
                "apogeeapp/app/WorkspaceUI.js",
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
                "apogeeapp/app/components/FunctionComponent.js",
                "apogeeapp/app/components/FolderFunctionComponent.js",
                "apogeeapp/app/components/BasicControlComponent.js",
                "apogeeapp/app/components/CustomControlComponent.js",
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
                "apogeeapp/app/actions/updatelinks.js",
                "apogeeapp/app/editors/ViewMode.js",
                "apogeeapp/app/editors/TextAreaEditor.js",
                "apogeeapp/app/editors/TextAreaMode.js",
                "apogeeapp/app/editors/AceTextEditor.js",		
                "apogeeapp/app/editors/AceCodeMode.js",
                "apogeeapp/app/editors/AceDataMode.js",
                "apogeeapp/app/editors/AceDescriptionMode.js",
                "apogeeapp/app/editors/AceTextMode.js",
                "apogeeapp/app/editors/AceSupplementalMode.js",
                "apogeeapp/app/editors/AceCustomControlMode.js",
                "apogeeapp/app/editors/HtmlJsDataDisplay.js",
                "apogeeapp/app/editors/JsDataDisplay.js",
                "apogeeapp/app/editors/JsonFormEditor.js",
                "apogeeapp/app/editors/FormDataMode.js",
                "apogeeapp/app/editors/HandsonGridEditor.js",
                "apogeeapp/app/editors/HandsonGridMode.js",
                "apogeeapp/app/editors/ControlOutputMode.js",
                "apogeeapp/app/dialogs/ConfigurableDialog.js",
                "apogeeapp/app/dialogs/UpdateLinksDialog.js",
                "apogeeapp/app/dialogs/SelectControlDialog.js",
                "apogeeapp/app/dialogs/propdialog.js"
            ],
            "dest": "../../dist/lib/apogee-base-app.js"
        },
        "dist_web_lib": {
            "options":{
                "banner":"/* Apogee Web Lib Version <%= pkg.version %> */\n"
            },
            "src": [
                "supplemental/webLibHeader.js",
                "../../dist/lib/apogee-base-lib.js"
            ],
            "dest": "../../dist/lib/apogee-web-lib.js"
        },
        "dist_web_app": {
            "options":{
                "banner":"/* Apogee Web App Version <%= pkg.version %> */\n"
            },
            "src": [
                "../../dist/lib/apogee-base-app.js"
            ],
            "dest": "../../dist/lib/apogee-web-app.js"
        },
        "dist_web_cutnpaste": {
            "options":{
                "banner":"/* Apogee Web Customization Version <%= pkg.version %> - Cut-n-Paste file open/close */\n"
            },
            "src": [
                "supplemental/cutNPasteCode/CutSaveDialog.js",
                "supplemental/cutNPasteCode/PasteOpenDialog.js",
                "supplemental/cutNPasteCode/file_impl_cutnpaste.js"
            ],
            "dest": "../../dist/lib/apogee-web-cutnpaste.js"
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
                "supplemental/electronCode/file_impl_electron.js",
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
      dist_web_cutnpaste: {
        files: {
          '../../dist/lib/apogee-web-cutnpaste.min.js': ['<%= concat.dist_web_cutnpaste.dest %>']
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
			"apogeeapp/app/apogeeapp.css",
            "apogeeapp/ui/jsonedit/jsonedit.css",
            "apogeeapp/ui/window/WindowFrame.css",
            "apogeeapp/ui/window/dialog.css",
            "apogeeapp/ui/displayandheader/DisplayAndHeader.css",
            "apogeeapp/ui/menu/Menu.css",
            "apogeeapp/ui/splitpane/SplitPane.css",
            "apogeeapp/ui/tabframe/TabFrame.css",
            "apogeeapp/ui/treecontrol/TreeControl.css",
          ],
          dest: "../../dist/lib/apogeeapp.css"
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
          {src: '../../dist/lib/apogee-web-cutnpaste.js', dest: '../../dist/web-dist/v<%= pkg.version %>/apogee-web-cutnpaste.js'},
          {src: '../../dist/lib/apogee-web-cutnpaste.min.js', dest: '../../dist/web-dist/v<%= pkg.version %>/apogee-web-cutnpaste.min.js'},
          {src: '../../dist/lib/apogeeapp.css', dest: '../../dist/web-dist/v<%= pkg.version %>/apogeeapp.css'},
          {expand: true, flatten: false, src: ['resources/**'], dest: '../../dist/web-dist/v<%= pkg.version %>/'},
          {expand: true, flatten: false, src: ['lib/**'], dest: '../../dist/web-dist/v<%= pkg.version %>/'},
          
          //electron
          {src: 'supplemental/debugHook.js', dest: '../../dist/electron-dist/v<%= pkg.version %>/debugHook.js'},
          {expand: true, flatten: true, src: ['supplemental/electronCode/app/*'], dest: '../../dist/electron-dist/v<%= pkg.version %>/', filter: 'isFile'},
          {src: '../../dist/lib/apogee-npm-lib.js', dest: '../../dist/electron-dist/v<%= pkg.version %>/apogee-npm-lib.js'},
          {src: '../../dist/lib/apogee-npm-app.js', dest: '../../dist/electron-dist/v<%= pkg.version %>/apogee-npm-app.js'},
          {src: '../../dist/lib/apogeeapp.css', dest: '../../dist/electron-dist/v<%= pkg.version %>/apogeeapp.css'},
          {expand: true, flatten: false, src: ['resources/**'], dest: '../../dist/electron-dist/v<%= pkg.version %>/'},
          
          
          

        ],
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-concat-css');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['concat', 'concat_css', 'uglify', 'copy']);

};