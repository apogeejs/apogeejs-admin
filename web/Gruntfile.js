module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
        "options": {
            "separator": ";\n"
        },
        "base_lib": {
            "src": [
                "hax/hax.js",
                "hax/lib/ActionResponse.js",
                "hax/lib/ActionError.js",
                "hax/lib/EventManager.js",
                "hax/lib/ContextManager.js",
                "hax/lib/codeCompiler.js",
                "hax/lib/codeAnalysis.js",
                "hax/lib/codeDependencies.js",
                "hax/lib/workspaceCalculation.js",
                "hax/lib/base.js",
                "hax/usrlib/util.js",
                "hax/datacomponents/Child.js",
                "hax/datacomponents/ContextHolder.js",
                "hax/datacomponents/DataHolder.js",
                "hax/datacomponents/Dependent.js",
                "hax/datacomponents/Codeable.js",
                "hax/datacomponents/Owner.js",
                "hax/datacomponents/Parent.js",
                "hax/datacomponents/RootHolder.js",
                "hax/data/Workspace.js",
                "hax/data/JsonTable.js",
                "hax/data/FunctionTable.js",
                "hax/data/Control.js",
                "hax/data/Folder.js",
                "hax/data/FolderFunction.js",               
                "hax/actions/createmember.js",
                "hax/actions/updatemember.js",
                "hax/actions/updatefolderfunction.js",
                "hax/actions/movemember.js",
                "hax/actions/deletemember.js"
            ],
            "dest": "../../dist/hax-base-lib.js"
        },
        "base_app": {
            "src": [
                "haxapp/haxapp.js",
                "haxapp/ui/haxappui.js",
                "haxapp/ui/ParentContainer.js",
                "haxapp/ui/ParentHighlighter.js",
                "haxapp/ui/WindowFrame.js",
                "haxapp/ui/SimpleParentContainer.js",
                "haxapp/ui/TabFrame.js",
                "haxapp/ui/Tab.js",
                "haxapp/ui/menu/Menu.js",
                "haxapp/ui/menu/MenuHeader.js",
                "haxapp/ui/menu/MenuBody.js",
                "haxapp/ui/jsonedit/jsonedit.js",
                "haxapp/ui/jsonedit/keyentry.js",
                "haxapp/ui/jsonedit/valueentry.js",
                "haxapp/ui/jsonedit/editfield.js",
                "haxapp/ui/jsonedit/jsoneditarea.js",
                "haxapp/ui/resize/resize.js",
                "haxapp/app/Hax.js",
                "haxapp/app/Hax.js",
                "haxapp/app/LinkManager.js",
                "haxapp/app/Component.js",
                "haxapp/app/EditComponentDisplay.js",
                "haxapp/app/WorkspaceUI.js",
                "haxapp/app/components/FolderComponent.js",
                "haxapp/app/components/JsonTableComponent.js",
                "haxapp/app/components/GridTableComponent.js",
                "haxapp/app/components/FunctionComponent.js",
                "haxapp/app/components/FolderFunctionComponent.js",
                "haxapp/app/components/BasicControlComponent.js",
                "haxapp/app/components/CustomControlComponent.js",
                "haxapp/app/actions/createworkspace.js",
                "haxapp/app/actions/closeworkspace.js",
                "haxapp/app/actions/updatecomponent.js",
                "haxapp/app/actions/addadditionalcomponent.js",
                "haxapp/app/actions/updatelinks.js",
                "haxapp/app/webCode/appmenus.js",
                "haxapp/app/webCode/openworkspace.js",
                "haxapp/app/webCode/saveworkspace.js",
                "haxapp/app/webCode/TempOpenDialog.js",
                "haxapp/app/webCode/TempSaveDialog.js",
                "haxapp/app/editors/TextAreaEditor.js",
                "haxapp/app/editors/TextAreaMode.js",
                "haxapp/app/editors/AceTextEditor.js",
                "haxapp/app/editors/AceCodeModeBase.js",
                "haxapp/app/editors/AceCodeMode.js",
                "haxapp/app/editors/AceDataMode.js",
                "haxapp/app/editors/AceSupplementalMode.js",
                "haxapp/app/editors/AceCustomCodeMode.js",
                "haxapp/app/editors/AceCustomSupplementalMode.js",
                "haxapp/app/editors/JsonFormEditor.js",
                "haxapp/app/editors/FormDataMode.js",
                "haxapp/app/editors/HandsonGridEditor.js",
                "haxapp/app/editors/HandsonGridMode.js",
                "haxapp/app/editors/ResourceOutputMode.js",
                "haxapp/app/dialogs/ConfigurableDialog.js",
                "haxapp/app/dialogs/CreateWorkspaceDialog.js",
                "haxapp/app/dialogs/UpdateLinksDialog.js",
                "haxapp/app/dialogs/SelectControlDialog.js"
            ],
            "dest": "../../dist/hax-base-app.js"
        },
        "dist_web_lib": {
            "options":{
                "banner":"/* Hax Web Lib Version <%= pkg.version %> */\n"
            },
            "src": [
                "customize/webLibHeader.js",
                "../../dist/hax-base-lib.js"
            ],
            "dest": "../../dist/hax-web-lib.js"
        },
        "dist_web_app": {
            "options":{
                "banner":"/* Hax Web App Version <%= pkg.version %> */\n"
            },
            "src": [
                "../../dist/hax-base-app.js"
            ],
            "dest": "../../dist/hax-web-app.js"
        },
        "dist_web_cutnpaste": {
            "options":{
                "banner":"/* Hax Web Customization Version <%= pkg.version %> - Cut-n-Paste file open/close */\n"
            },
            "src": [
                "haxapp/customize/cutNPasteCode/CutSaveDialog.js",
                "haxapp/customize/cutNPasteCode/PasteOpenDialog.js",
                "haxapp/customize/cutNPasteCode/file_impl_cutnpaste.js"
            ],
            "dest": "../../dist/hax-web-cutnpaste.js"
        },
        "dist_npm_lib": {
            "options":{
                "banner":"/* Hax NPM Lib Version <%= pkg.version %> */\n"
            },
            "src": [
                "customize/npmLibHeader.js",
                "../../dist/hax-base-lib.js",
                "customize/npmLibFooter.js"
            ],
            "dest": "../../dist/hax-npm-lib.js"
        },
        "dist_npm_app": {
            "options":{
                "banner":"/* Hax NPM App Version <%= pkg.version %> */\n"
            },
            "src": [
                "../../dist/hax-base-app.js",
                "haxapp/customize/electronCode/custom_menus_electron.js",
                "haxapp/customize/electronCode/file_impl_electron.js",
                "customize/npmAppFooter.js"
            ],
            "dest": "../../dist/hax-npm-app.js"
        }
    },
    uglify: {
      options: {
        banner: '/*! hax <%= pkg.version %> */\n'
      },
      dist_web_lib: {
        files: {
          '../../dist/hax-web-lib.min.js': ['<%= concat.dist_web_lib.dest %>']
        }
      },
      dist_web_app: {
        files: {
          '../../dist/hax-web-app.min.js': ['<%= concat.dist_web_app.dest %>']
        }
      },
      dist_web_cutnpaste: {
        files: {
          '../../dist/hax-web-cutnpaste.min.js': ['<%= concat.dist_web_cutnpaste.dest %>']
        }
      },
	  dist_npm_lib: {
        files: {
          '../../dist/hax-npm-lib.min.js': ['<%= concat.dist_npm_lib.dest %>']
        }
      },
	  dist_npm_app: {
        files: {
          '../../dist/hax-npm-app.min.js': ['<%= concat.dist_npm_app.dest %>']
        }
      }
    },
    concat_css: {
        options: {
          banner: '/*! hax <%= pkg.version %> */\n' 
        },
        all: {
          src: [
			"haxapp/ui/jsonedit/jsonedit.css",
			"haxapp/ui/windowFrame.css",
			"haxapp/ui/dialog.css"
          ],
          dest: "../../dist/haxapp.css"
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