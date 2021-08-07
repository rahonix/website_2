'use strict';

const browserSync = require('browser-sync').create();
const gulp = require('gulp');
const spawn = require('child_process').spawn;
const sass = require('gulp-sass')(require('sass'));
const reload = browserSync.reload;

function buildStyles() {
    return gulp.src('./website/static/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./website/static/css'));
  };

function runServer(callback) {
    const cmd = spawn('python', ['manage.py', 'runserver'], {stdio: 'inherit'});
    cmd.on('close', (code) => {
        console.log('runServer exited with code ' + code);
        callback(code);
    })
}

function initBrowserSync() {
    setTimeout(() => {
        browserSync.init(
            [
                './website/static/css/*.css',
                './website/static/js/*.js',
                './website/static/templates/*.html',
            ], {
                proxy: 'localhost:8000',
            }
        )
    }, 1000);
}

function watch() {
    gulp.watch('./website/static/scss/*.scss', gulp.series('buildStyles')).on("change", reload);
    gulp.watch('./website/Static/css/*.css').on("change", reload);
};

const dev = gulp.parallel(
    runServer,
    initBrowserSync,
    watch,
)

exports.buildStyles = buildStyles;
exports.dev = dev;