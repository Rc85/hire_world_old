module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/scss',
                        src: ['*.scss', '**/*.scss'],
                        dest: 'dist/css',
                        ext: '.css'
                    },
                    {
                        expand: true,
                        cwd: 'dist/scss',
                        src: ['*.scss', '**/*.scss'],
                        dest: 'dist/css',
                        ext: '.css'
                    }
                ]
            }
        },
        watch: {
            files: ['src/scss/*.scss', 'src/scss/**/*.scss', 'dist/scss/*.scss', 'dist/scss/**/*.scss'],
            tasks: ['sass:dist:newer']
        }
    })

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-newer');
    grunt.registerTask('default', ['watch']);
}