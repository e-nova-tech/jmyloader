module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist_full: {
        src: [
          'js/libs/*.js',
          'js/*.js'
        ],
        dest: 'js/build/jmyloader-full.js'
      },
      dist_nolibs: {
        src: [
          'js/*.js'
        ],
        dest: 'js/build/jmyloader.js'
      }
    },
    uglify: {
      build_full: {
        src: 'js/build/jmyloader-full.js',
        dest: 'js/build/jmyloader-full.min.js'
      },
      build_nolibs: {
        src: 'js/build/jmyloader.js',
        dest: 'js/build/jmyloader.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['concat', 'uglify']);
};
