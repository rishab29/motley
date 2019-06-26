var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var serveStatic = require('serve-static');
var fs = require('fs')
const path = require('path')
const config = require('./motley.config.json')
var mountFolder = function (connect, dir) {
  return serveStatic(require('path').resolve(dir));
};

const getPartials = () => {
  const commonComponents = fs.readdirSync('./examples/components')
    .filter(filename => filename.split('.').pop() === 'hbs')
    .map(filename => filename.split('.')[0])
    .reduce((acc, filename) => {
      acc[filename] = path.join('./examples/components', filename + '.hbs')
      return acc;
    }, {})

  const applicationComponents = config.applications.map(m =>
    fs.readdirSync(`./examples/components/${m}`)
      .filter(filename => filename.split('.').pop() === 'hbs')
      .map(filename => filename.split('.')[0])
      .reduce((acc, filename) => {
        acc[filename] = path.join(`./examples/components/${m}`, filename + '.hbs')
        return acc;
      }, {})
  )
  .reduce((acc, application) => Object.assign(acc, application), {})

  return Object.assign(commonComponents, applicationComponents)
}

const getFiles = () => {
  const commonViews = fs.readdirSync(`./examples/views`)
    .filter(filename => filename.split('.').pop() === 'hbs')
    .map(filename => filename.split('.')[0])
    .reduce((acc, filename) => {
      acc[path.join('./examples/html', filename + '.html')] = path.join('./examples/views', filename + '.hbs')
      return acc;
    }, {})

  const applicationViews = config.applications.map(m =>
    fs.readdirSync(`./examples/views/${m}`)
      .filter(filename => filename.split('.').pop() === 'hbs')
      .map(filename => filename.split('.')[0])
      .reduce((acc, filename) => {
        acc[path.join('./examples/html', filename + '.html')] = path.join(`./examples/views/${m}`, filename + '.hbs')
        return acc;
      }, {})
  )
    .reduce((acc, application) => Object.assign(acc, application), {})

  return Object.assign(commonViews, applicationViews)
}


module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    sass: {
      dist: {
        files: {
          'examples/public/stylesheets/style.css': 'sass/styles/app.scss'
        }
      }
    },
    hbs: {
      public: {
        options: {
          layout: './examples/views/layouts/default.hbs',
          partials: getPartials(),
        },
        files: getFiles()
      }
    },
    watch: {
      static: {
        files: ['public/**/*'],
        options: {
          livereload: true
        }
      },
      hbs: {
        files: ['examples/views/**/*.hbs', 'examples/components/**/*.hbs'],
        tasks: ['hbs'],
        options: {
          livereload: true
        }
      },
      source: {
        files: ['sass/**/**/*.scss'],
        tasks: ['sass'],
        options: {
          livereload: true
        }
      }
    },
    connect: {
      options: {
        port: 9000,
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              //lrSnippet,
              mountFolder(connect, './examples/public'),
              mountFolder(connect, './examples/html')
            ];
          }
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:9000'
      }
    },
    clean: [
      'dist',
      'live',
      'examples/html',
      'examples/public/stylesheets/'
    ]
  });

  grunt.registerTask('server', function (target) {
    grunt.task.run([
      'hbs',
      'sass',
      'connect',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('build', function (target) {
    grunt.task.run([
      'hbs',
      'sass'
    ]);
  });
};
