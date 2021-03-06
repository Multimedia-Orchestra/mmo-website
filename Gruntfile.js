/*
 * holonomy-website
 * https://github.com/holonomy/website
 * licensed under the AGPLv3 license.
 */

'use strict';

var _ = require('lodash');

var banner = '/* <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n';

module.exports = function(grunt) {

  // project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // lint JavaScript
    jshint: {
      all: ['Gruntfile.js', 'helpers/*.js'],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // build HTML from templates and data
    assemble: {
      options: {
        pkg: '<%= pkg %>',
        flatten: true,
        assets: 'assets',
        partials: ['templates/includes/*.hbs'],
        helpers: ['templates/helpers/*.js'],
        layout: 'templates/layouts/index.hbs',
        data: ['data/*.{json,yml}'],
      },
      build: {
        files: {'build/': ['templates/*.hbs']},
      },
    },

    // compile LESS to CSS
    less: {
      options: {
        banner: banner,
        paths: [
          'node_modules/bootstrap/less',
          'styles',
        ],
      },
      develop: {
        files: {
          'build/index.css': 'styles/index.less',
        },
      },
      deploy: {
        options: {
          cleancss: true,
          report: 'min',
          sourceMap: true,
        },
        files: {
          'build/index.css': 'styles/index.less',
        },
      },
    },

    // before generating any new files,
    // remove any previously-created files.
    clean: {
      build: ['build/**/*']
    },

    copy: {
      assets: {
        expand: true,
        cwd: 'assets',
        src: ['**'],
        dest: 'build/',
      },
    },

    connect: {
      options: {
        port: 5000,
        base: 'build',
      },
      develop: {
        options: {
          livereload: true,
        },
      },
      default: {
        options: {
          keepalive: true,
        },
      },
    },

    watch: {
      livereload: {
        options: {
          livereload: true,
        },
        files: ['build/**/*'],
      },
      all: {
        files: ['<%= jshint.all %>'],
        tasks: ['jshint'],
      },
      grunt: {
        files: ['Gruntfile.js'],
        tasks: ['clean', 'assemble', 'less:develop'],
      },
      less: {
        files: _.map(grunt.config.get('less.options.paths'),
          function (p) { return p + '/*.less'; }
        ),
        tasks: ['less'],
      },
      assemble: {
        files: ['README.md', 'templates/**/*.hbs', 'templates/helpers/*.js'],
        tasks: ['assemble'],
      },
    },

    compress: {
      options: {
        mode: 'gzip',
      },
      deploy: {
        files: [
          {
            expand: true,
            cwd: 'build',
            src: '**/*',
            dest: 'build',
            filter: 'isFile',
          },
        ],
      },
    },

    hashres: {
      deploy: {
        src: [
          'build/*.css*'
        ],
        dest: 'build/**/*.html',
      },
    },

    'gh-pages': {
      deploy: {
        options: {
          base: 'build',
          repo: 'git@github.com:Mutlimedia-Orchestra/Multimedia-Orchestra.github.io',
          branch: 'master',
          message: banner,
        },
        src: ['**/*'],
      },
    },
  });

  // load npm plugins to provide necessary tasks.
  require('load-grunt-tasks')(grunt, {
    pattern: ['grunt-*', 'assemble*'],
  });

  // register grunt tasks
  grunt.registerTask('develop', ['clean', 'jshint', 'assemble', 'less:develop', 'copy:assets', 'connect:develop', 'watch']);
  grunt.registerTask('deploy', ['clean', 'jshint', 'assemble', 'less:deploy', 'copy:assets', 'compress', 'hashres', 'gh-pages']);

  // default task to be run.
  grunt.registerTask('default', ['clean', 'assemble', 'less:deploy', 'connect:default']);
};
