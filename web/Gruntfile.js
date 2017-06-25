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
                "apogee/lib/ActionResponse.js",
                "apogee/lib/ActionError.js",
                "apogee/lib/EventManager.js",
                "apogee/lib/ContextManager.js",
                "apogee/lib/codeCompiler.js",
                "apogee/lib/codeAnalysis.js",
                "apogee/lib/codeDependencies.js",
                "apogee/lib/workspaceCalculation.js",
                "apogee/lib/base.js",
                "apogee/usrlib/util.js",
                "apogee/datacomponents/Child.js",
                "apogee/datacomponents/ContextHolder.js",
                "apogee/datacomponents/DataHolder.js",
                "apogee/datacomponents/Dependent.js",
                "apogee/datacomponents/Codeable.js",
                "apogee/datacomponents/Owner.js",
                "apogee/datacomponents/Parent.js",
                "apogee/datacomponents/RootHolder.js",
                "apogee/data/Workspace.js",
                "apogee/data/JsonTable.js",
                "apogee/data/FunctionTable.js",
                "apogee/data/Control.js",
                "apogee/data/Folder.js",
                "apogee/data/FolderFunction.js",               
                "apogee/actions/createmember.js",
                "apogee/actions/updatemember.js",
                "apogee/actions/updatefolderfunction.js",
                "apogee/actions/movemember.js",
                "apogee/actions/deletemember.js"
            ],
            "dest": "../../dist/apogee-base-lib.js"
        },
        "base_app": {
            "src": [
                "apogeeapp/apogeeapp.js",
                "apogeeapp/ui/apogeeappui.js",
                "apogeeapp/ui/ParentContainer.js",
                "apogeeapp/ui/ParentHighlighter.js",
                "apogeeapp/ui/WindowFrame.js",
                "apogeeapp/ui/SimpleParentContainer.js",
                "apogeeapp/ui/TabFrame.js",
                "apogeeapp/ui/Tab.js",
                "apogeeapp/ui/menu/Menu.js",
                "apogeeapp/ui/menu/MenuHeader.js",
                "apogeeapp/ui/menu/MenuBody.js",
                "apogeeapp/ui/jsonedit/jsonedit.js",
                "apogeeapp/ui/jsonedit/keyentry.js",
                "apogeeapp/ui/jsonedit/valueentry.js",
                "apogeeapp/ui/jsonedit/editfield.js",
                "apogeeapp/ui/jsonedit/jsoneditarea.js",
                "apogeeapp/ui/resize/resize.js",
                "apogeeapp/app/Apogee.js",
                "apogeeapp/app/Apogee.js",
                "apogeeapp/app/LinkManager.js",
                "apogeeapp/app/Component.js",
                "apogeeapp/app/EditComponentDisplay.js",
                "apogeeapp/app/WorkspaceUI.js",
                "apogeeapp/app/components/FolderComponent.js",
                "apogeeapp/app/components/JsonTableComponent.js",
                "apogeeapp/app/components/GridTableComponent.js",
                "apogeeapp/app/components/FunctionComponent.js",
                "apogeeapp/app/components/FolderFunctionComponent.js",
                "apogeeapp/app/components/BasicControlComponent.js",
                "apogeeapp/app/components/CustomControlComponent.js",
                "apogeeapp/app/actions/createworkspace.js",
                "apogeeapp/app/actions/closeworkspace.js",
                "apogeeapp/app/actions/updatecomponent.js",
                "apogeeapp/app/actions/addadditionalcomponent.js",
                "apogeeapp/app/actions/updatelinks.js",
                "apogeeapp/app/webCode/appmenus.js",
                "apogeeapp/app/webCode/openworkspace.js",
                "apogeeapp/app/webCode/saveworkspace.js",
                "apogeeapp/app/webCode/TempOpenDialog.js",
                "apogeeapp/app/webCode/TempSaveDialog.js",
                "apogeeapp/app/editors/TextAreaEditor.js",
                "apogeeapp/app/editors/TextAreaMode.js",
                "apogeeapp/app/editors/AceTextEditor.js",
                "apogeeapp/app/editors/AceCodeModeBase.js",
                "apogeeapp/app/editors/AceCodeMode.js",
                "apogeeapp/app/editors/AceDataMode.js",
                "apogeeapp/app/editors/AceSupplementalMode.js",
                "apogeeapp/app/editors/AceCustomCodeMode.js",
                "apogeeapp/app/editors/AceCustomSupplementalMode.js",
                "apogeeapp/app/editors/JsonFormEditor.js",
                "apogeeapp/app/editors/FormDataMode.js",
                "apogeeapp/app/editors/HandsonGridEditor.js",
                "apogeeapp/app/editors/HandsonGridMode.js",
                "apogeeapp/app/editors/ResourceOutputMode.js",
                "apogeeapp/app/dialogs/ConfigurableDialog.js",
                "apogeeapp/app/dialogs/CreateWorkspaceDialog.js",
                "apogeeapp/app/dialogs/UpdateLinksDialog.js",
                "apogeeapp/app/dialogs/SelectControlDialog.js"
            ],
            "dest": "../../dist/apogee-base-app.js"
        },
        "dist_web_lib": {
            "options":{
                "banner":"/* Apogee Web Lib Version <%= pkg.version %> */\n"
            },
            "src": [
                "customize/webLibHeader.js",
                "../../dist/apogee-base-lib.js"
            ],
            "dest": "../../dist/apogee-web-lib.js"
        },
        "dist_web_app": {
            "options":{
                "banner":"/* Apogee Web App Version <%= pkg.version %> */\n"
            },
            "src": [
                "../../dist/apogee-base-app.js"
            ],
            "dest": "../../dist/apogee-web-app.js"
        },
        "dist_web_cutnpaste": {
            "options":{
                "banner":"/* Apogee Web Customization Version <%= pkg.version %> - Cut-n-Paste file open/close */\n"
            },
            "src": [
                "apogeeapp/customize/cutNPasteCode/CutSaveDialog.js",
                "apogeeapp/customize/cutNPasteCode/PasteOpenDialog.js",
                "apogeeapp/customize/cutNPasteCode/file_impl_cutnpaste.js"
            ],
            "dest": "../../dist/apogee-web-cutnpaste.js"
        },
        "dist_npm_lib": {
            "options":{
                "banner":"/* Apogee NPM Lib Version <%= pkg.version %> */\n"
            },
            "src": [
                "customize/npmLibHeader.js",
                "../../dist/apogee-base-lib.js",
                "customize/npmLibFooter.js"
            ],
            "dest": "../../dist/apogee-npm-lib.js"
        },
        "dist_npm_app": {
            "options":{
                "banner":"/* Apogee NPM App Version <%= pkg.version %> */\n"
            },
            "src": [
                "../../dist/apogee-base-app.js",
                "apogeeapp/customize/electronCode/custom_menus_electron.js",
                "apogeeapp/customize/electronCode/file_impl_electron.js",
                "customize/npmAppFooter.js"
            ],
            "dest": "../../dist/apogee-npm-app.js"
        }
    },
    uglify: {
      options: {
        banner: '/*! apogee <%= pkg.version %> */\n'
      },
      dist_web_lib: {
        files: {
          '../../dist/apogee-web-lib.min.js': ['<%= concat.dist_web_lib.dest %>']
        }
      },
      dist_web_app: {
        files: {
          '../../dist/apogee-web-app.min.js': ['<%= concat.dist_web_app.dest %>']
        }
      },
      dist_web_cutnpaste: {
        files: {
          '../../dist/apogee-web-cutnpaste.min.js': ['<%= concat.dist_web_cutnpaste.dest %>']
        }
      },
	  dist_npm_lib: {
        files: {
          '../../dist/apogee-npm-lib.min.js': ['<%= concat.dist_npm_lib.dest %>']
        }
      },
	  dist_npm_app: {
        files: {
          '../../dist/apogee-npm-app.min.js': ['<%= concat.dist_npm_app.dest %>']
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
			"apogeeapp/ui/windowFrame.css",
			"apogeeapp/ui/dialog.css"
          ],
          dest: "../../dist/apogeeapp.css"
        },
      },
    copy: {
      main: {
        files: [

          // includes files within path and its sub-directories 
          {expand: true, flatten: true, src: ['resources/*'], dest: '../../dist/resources/', filter: 'isFile'},

        ],
      },
    },

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-concat-css');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['concat', 'concat_css', 'uglify', 'copy']);

};