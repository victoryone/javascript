module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-concat-sourcemap");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.initConfig({
        pkg: grunt.file.readJSON('./package.json'),
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                node: true
            },
            globals: {
                exports: true,
                module: false
            }
        },
        concat: {
            options: {
                sourcemap: 'use'
            },
            js: {
                src:[
                    "./js/src/common.js",
                    "./js/src/common.number.js",
                    "./js/src/common.string.js",
                    "./js/src/common.date.js",
                    "./js/src/common.object.js",
                    "./js/src/common.array.js",
                    "./js/src/common.uri.js",
                    "./js/src/common.util.js",
                    "./js/src/common.css3.js",
                    "./js/src/common.cookie.js",
                    "./js/src/common.valid.js",
                    "./js/src/common.globalevents.js",
                    "./js/src/ui/common.ui.js"
                ],
                dest: "./js/src/common.concat.js"
            }
        },
        concat_sourcemap: {
            options: {
                // Task-specific options go here.
            },
            js: {
                files: {
                    './js/src/common.concat.js': [
                        "./js/src/common.js",
                        "./js/src/common.number.js",
                        "./js/src/common.string.js",
                        "./js/src/common.date.js",
                        "./js/src/common.object.js",
                        "./js/src/common.array.js",
                        "./js/src/common.uri.js",
                        "./js/src/common.util.js",
                        "./js/src/common.css3.js",
                        "./js/src/common.cookie.js",
                        "./js/src/common.valid.js",
                        "./js/src/common.globalevents.js"
                    ]
                }
            }
        },

        uglify: {
            js: {
                files: [
                    {
                        expand: true,
                        cwd: './js/src/ui',
                        src: "**/*.js",
                        dest: "./js/ui"
                    },
                    {
                        src: "./js/src/common.concat.js",
                        dest: "./js/common.min.js"
                    }
                ]
            }
        },
        less: {
            style: {
                files: [
                    {
                        expand: true,
                        cwd: './css/less/',
                        src: "*.less",
                        dest: "./css/",
                        ext: '.css'
                    }
                ]
            }
        },
        sass: {
            options: {
                sourcemap: 'none'
            },
            style: {
                files: [
                    {
                        expand: true,
                        cwd: './css/sass/',
                        src: "*.scss",
                        dest: "./css/",
                        ext: '.css'
                    }
                ]
            }
        },
        /*
        qunit: {
            files: ['test\/*.html']
        },
         */

        watch: {
            options: {
                livereload: true,
                spawn: false
            },
            js: {
                //files: [/*'./js/src/*.js', */'./js/src/*.js', './js/src/ui/*.js'],
                //tasks: [/*'concat:js', */'concat_sourcemap:js', 'uglify:js']
                files: ['./js/src/*.js', './js/src/ui/*.js'],
                tasks: ['concat:js', 'uglify:js']
            },
            css: {
                files: ['./css/*.less', './css/*.scss'],
                tasks: ['less:style', 'sass:style']
            }
        }
    });

    grunt.registerTask('dev', ['watch']);
    //grunt.registerTask("default", [/*'jshint', 'concat', 'uglify', 'less', */'watch']);
    //grunt.registerTask("default", [/*'jshint', 'concat', 'uglify', 'less', */'watch']);
}