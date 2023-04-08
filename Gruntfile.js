module.exports = function (grunt) {
    grunt.initConfig({
        babel: {
            options: {
                presets: ['@babel/preset-env']
            },
            dist: {
                files: {
                    'dist/memman.min.js': 'src/index.js'
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-babel');
    grunt.registerTask('default', ['babel']);
};