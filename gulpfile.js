'use strict';

const fs = require('fs');
const browserSync = require('browser-sync').create();
const gulp = require('gulp');
const spawn = require('child_process').spawn;
const sass = require('gulp-sass')(require('sass'));
const webpack = require('webpack-stream');
const uglify = require('gulp-uglify');
const merge = require('merge-stream');
const reload = browserSync.reload;

const APP_FOLDERS = fs.readdirSync('./website/static/');

/* Builds minified css from scss source files */
function buildStyles() {
    const tasks = APP_FOLDERS.map( (APP) => {
        return gulp.src(`./website/static/${APP}/scss/*.scss`)
            .pipe(sass( /*{outputStyle: 'compressed'}*/ ).on('error', sass.logError))
            .pipe(gulp.dest(`./website/static/${APP}/css/`));
    });
    return merge(tasks);
  };

/* Builds bundled, uglified and minified js from js source files */
function bundleJS() {
    const tasks = APP_FOLDERS.map( (APP) => {
        return gulp.src(`./website/static/${APP}/js/index.js`)
        .pipe(
            webpack({
                mode: 'development',
                output: {
                    filename:'index.bundle.js',
                }
            })
            )
            // .pipe(uglify())
            .pipe(gulp.dest(`./website/static/${APP}/js/dist/`))
    });
    return merge(tasks);
}

/* Runs development server */
function runServer(callback) {
    const cmd = spawn('python', ['manage.py', 'runserver'], {stdio: 'inherit'});
    cmd.on('close', (code) => {
        console.log('runServer exited with code ' + code);
        callback(code);
    })
}

/* Initializes the BrowserSync development server which proxies the django development server 
   to watch for changing files and automaticly reloading the page */
function initBrowserSync() {
    setTimeout(() => {
        browserSync.init(
            [
                './website/static/**/css/*.css',
                './website/static/**/js/*.js',
                './website/static/**/templates/*.html',
            ], {
                proxy: 'localhost:8000',
            }
        )
    }, 2000);
}

/* Watch function contains files which on change trigger the browsersync page reload */
function watch() {
    gulp.watch(['./website/static/**/scss/*.scss', './website/static/**/scss/**/*.scss'], gulp.series('buildStyles')).on('change', reload);
    gulp.watch(['./website/Static/**/js/*.js', 
                './website/static/**/js/**/*.js',
                '!./website/static/**/js/dist/*'], gulp.series('bundleJS')).on('change', reload);
    gulp.watch(['./website/templates/*.html', './website/templates/**/*.html']).on('change', reload);
};

const dev = gulp.parallel(
    runServer,
    initBrowserSync,
    watch,
)

exports.bundleJS = bundleJS
exports.buildStyles = buildStyles;
exports.dev = dev;