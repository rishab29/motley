module.exports = function(grunt) {
    grunt.initConfig ({
        sass: {
            dist: {
                files: {
                    'public/stylesheets/style.css' : 'sass/styles/app.scss'
                }
            }
        },

        watch: {
            source: {
                files: ['sass/**/*.scss'],
                tasks: ['sass'],
                options: {
                    livereload: true
                }
            }
        }


    });

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['watch','sass']);
};