module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';\n'
      },
      dist: {
        src: [
			"hax.js",
			"core/core.js",
			"core/lib/EventManager.js",
			"core/lib/ContextManager.js",
			"core/lib/codeCompiler.js",
			"core/lib/codeAnalysis.js",
			"core/lib/codeDependencies.js",
			"core/lib/workspaceCalculation.js",
			"core/lib/util.js",
			"core/datacomponents/Child.js",
			"core/datacomponents/ContextHolder.js",
			"core/datacomponents/DataHolder.js",
			"core/datacomponents/Dependent.js",
			"core/datacomponents/Codeable.js",
			"core/datacomponents/Owner.js",
			"core/datacomponents/Parent.js",
			"core/datacomponents/RootHolder.js",
			"core/data/Workspace.js",
			"core/data/JsonTable.js",
			"core/data/FunctionTable.js",
			"core/data/Control.js",
			"core/data/Folder.js",
			"core/data/FolderFunction.js",
			"core/actions/ActionResponse.js",
			"core/actions/ActionError.js",
			"core/actions/createmember.js",
			"core/actions/updatemember.js",
			"core/actions/updatefolderfunction.js",
			"core/actions/movemember.js",
			"core/actions/deletemember.js",
			"ui/visiui/visiui.js",
			"ui/visiui/ParentContainer.js",
			"ui/visiui/ParentHighlighter.js",
			"ui/visiui/WindowFrame.js",
			"ui/visiui/SimpleParentContainer.js",
			"ui/visiui/TabFrame.js",
			"ui/visiui/Tab.js",
			"ui/visiui/menu/Menu.js",
			"ui/visiui/menu/StaticMenu.js",
			"ui/visiui/menu/MenuBody.js",
			"ui/visiui/jsonedit/jsonedit.js",
			"ui/visiui/jsonedit/keyentry.js",
			"ui/visiui/jsonedit/valueentry.js",
			"ui/visiui/jsonedit/editfield.js",
			"ui/visiui/jsonedit/jsoneditarea.js",
			"ui/visiui/resize/resize.js",
			"app/visiui/Hax.js",
			"app/visiui/LinkManager.js",
			"app/visiui/Component.js",
			"app/visiui/TableEditComponent.js",
			"app/visiui/WorkspaceUI.js",
			"app/visiui/components/FolderComponent.js",
			"app/visiui/components/JsonTableComponent.js",
			"app/visiui/components/GridTableComponent.js",
			"app/visiui/components/FunctionComponent.js",
			"app/visiui/components/FolderFunctionComponent.js",
			"app/visiui/components/BasicControlComponent.js",
			"app/visiui/components/CustomControlComponent.js",
			"app/visiui/components/CustomResource.js",
			"app/visiui/actions/openworkspace.js",
			"app/visiui/actions/createworkspace.js",
			"app/visiui/actions/closeworkspace.js",
			"app/visiui/actions/saveworkspace.js",
			"app/visiui/actions/updatecomponent.js",
			"app/visiui/actions/addadditionalcomponent.js",
			"app/visiui/actions/updatelinks.js",
			"app/visiui/editors/TextAreaEditor.js",
			"app/visiui/editors/TextAreaMode.js",
			"app/visiui/editors/AceTextEditor.js",
			"app/visiui/editors/AceCodeModeBase.js",
			"app/visiui/editors/AceCodeMode.js",
			"app/visiui/editors/AceDataMode.js",
			"app/visiui/editors/AceSupplementalMode.js",
			"app/visiui/editors/AceCustomCodeMode.js",
			"app/visiui/editors/AceCustomSupplementalMode.js",
			"app/visiui/editors/JsonFormEditor.js",
			"app/visiui/editors/FormDataMode.js",
			"app/visiui/editors/HandsonGridEditor.js",
			"app/visiui/editors/HandsonGridMode.js",
			"app/visiui/editors/ResourceOutputMode.js",
			"app/visiui/dialogs/ConfigurableDialog.js",
			"app/visiui/dialogs/CreateWorkspaceDialog.js",
			"app/visiui/dialogs/TempOpenDialog.js",
			"app/visiui/dialogs/TempSaveDialog.js",
			"app/visiui/dialogs/UpdateLinksDialog.js",
			"app/visiui/dialogs/SelectControlDialog.js"
          ],
        dest: '../../dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          '../../dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    concat_css: {
        options: {
          // Task-specific options go here. 
        },
        all: {
          src: [
			"ui/visiui/jsonedit/jsonedit.css",
			"ui/visiui/windowFrame.css",
			"ui/visiui/dialog.css"
          ],
          dest: "../../dist/hax_cat.css"
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