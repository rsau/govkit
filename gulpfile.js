'use strict';

// *************************
//
// Run 'gulp' to watch directory for changes for images, fonts icons, Sass, etc.
// Or for full site testing run 'gulp test'
//
// *************************


// Include gulp.
const gulp = require('gulp');

// Include plug-ins.
const jshint                = require('gulp-jshint');
const imagemin              = require('gulp-imagemin');
const cleanCSS              = require('gulp-clean-css');
const concat                = require('gulp-concat');
const del                   = require('del');
const uglify                = require('gulp-uglify');
const iconfont              = require('gulp-iconfont');
const iconfontCss           = require('gulp-iconfont-css');
const iconfontTemplate      = require('gulp-iconfont-template');
const groupMediaQueries     = require('gulp-group-css-media-queries');
const extractMediaQueries   = require('gulp-extract-media-queries');
const gulpLoadPlugins       = require('gulp-load-plugins');
const pa11y                 = require('gulp-pa11y');
const w3cValidation         = require('gulp-w3c-html-validation');
const casperJs              = require('gulp-casperjs');
const realFavicon           = require('gulp-real-favicon');
const fs                    = require('fs'); // Used by check-for-favicon-update.
const plumber               = require('gulp-plumber'); // For error handling.
const gutil                 = require('gulp-util'); // For error handling.
const postcss               = require('gulp-postcss');
const cssNano               = require('cssnano');
const atImport              = require('postcss-import');
const runSequence           = require('run-sequence');
const modernizr             = require('gulp-modernizr');

// Project vars
// URL to test locally.
const localSiteURL = 'http://localhost:3000/';
// Name of the icon font.
const fontName = 'govstrap-icons';
// Favicon related settings.
const faviconColour = '#ffffff';
const faviconBackgroundColour = '#384249';

var options = {};

options.rootPath = {
  project     : __dirname + '/',
  styleGuide  : __dirname + '/styleguide/',
  theme       : __dirname + '/'
};

options.theme = {
  root    : options.rootPath.theme,
  css     : options.rootPath.theme + 'css/',
  sass    : options.rootPath.theme + 'src/sass/',
  jsSrc   : options.rootPath.theme + 'src/js/',
  js      : options.rootPath.theme + 'js/',
  src     : options.rootPath.theme + 'src/'
};

var sassFiles = [
  options.theme.sass + '**/*.scss',
  // Do not open Sass partials as they will be included as needed.
  '!' + options.theme.sass + '**/_*.scss',
  // Hide additional files
  '!' + options.theme.sass + 'vendors/uikit.scss'
];

var $ = gulpLoadPlugins();

// ********************************************************************************************************************************************

// Error Handling to stop file watching from dying on an error (ie: Sass compiling).
var onError = function(err) {
  gutil.beep();
  console.log(err);
};

// Clean CSS files.
gulp.task('clean:css', function() {
  return del([
    options.theme.css + '**/*.css',
    options.theme.css + '**/*.map',
    '!' + options.theme.css + 'print.css'
  ], {force: true});
});

// Clean JS files.
gulp.task('clean:js', function() {
  return del([
    options.theme.js + 'dist/*.js',
  ], {force: true});
});

/**
 * Generate css with source map.
 */
gulp.task('styles:generate:dev', function(){
  return gulp.src(sassFiles)
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      sourcemap: true,
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.sourcemaps.write('./'))
    .pipe($.size({title: 'Styles'}))
    .pipe(gulp.dest(options.theme.css));
});

/**
 * Generate css without source map.
 */
gulp.task('styles:generate:prod', function(){
  return gulp.src(sassFiles)
    .pipe($.sass({
      precision: 10,
      sourcemap: false
    }).on('error', $.sass.logError))
    .pipe($.size({title: 'Styles (prod)'}))
    .pipe(gulp.dest(options.theme.css));
});

/**
 * Compress css.
 */
gulp.task('css:compress', function(){
  return gulp.src(options.theme.css + '/*.css')
    .pipe(cleanCSS({compatibility: 'ie10'}))
    .pipe(gulp.dest(options.theme.css));
});

/**
 * Break a css into separate files for each break point.
 */
gulp.task('css:break-at-media', function() {
  return gulp.src(options.theme.css + '/styles.css')
    .pipe(extractMediaQueries())
    .pipe(groupMediaQueries())
    .pipe(gulp.dest(options.theme.css));
});

/**
 * Generate styles: source map = on, compression = off.
 */
gulp.task('styles:dev', function(callback) {
  runSequence(
    'clean:css',
    'styles:generate:dev',
    'css:break-at-media',
    callback);
});

/**
 * Generate JS
 */
gulp.task('js:build', function(callback) {
  runSequence(
    'clean:js',
    'js:minify',
    callback);
});

/**
 * Compress JS.
 */

gulp.task('js:minify', function() {
  gulp.src(options.theme.jsSrc + '*.js')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(uglify())
    .pipe(gulp.dest(options.theme.js))
});

/**
 * Generate styles: source map = off, compression = on.
 */
gulp.task('styles:prod', function(callback) {
  runSequence(
    'clean:css',
    'styles:generate:prod',
    'css:break-at-media',
    'css:compress',
    callback);
});

/**
 * Modernizr
 */
gulp.task('modernizr', function() {
  gulp.src(options.theme.css + 'js/*.js')
    .pipe(modernizr())
    .pipe(gulp.dest('./js/'))
});


/**
 * Optimise favicons
 */
gulp.task('favicons', function() {
  return gulp.src(options.theme.css + 'favicon/favicons/**/*')
    .pipe(imagemin({
      optimizationLevel: 3
    }))
    .pipe(gulp.dest('./favicons'))
});


/**
 * Optimise images
 */
gulp.task('images', function() {
  return gulp.src(options.theme.css + 'img/**/*')
    .pipe(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true,
    }))
    .pipe(gulp.dest('./img'))
});


// SVG files to a font file.
gulp.task('iconFont', function() {
  var runTimestamp = Math.round(Date.now() / 1000);
  return gulp.src([options.theme.css + 'font-icons/**'])
    .pipe(iconfontCss({
      fontName: fontName,
      path: 'scss',
      targetPath: options.theme.css + 'sass/_' + fontName + '.scss', // Relative to the path used in gulp.dest()
      fontPath: '/fonts/' // Relative to the site.
    }))
    .pipe(iconfont({
      fontName: fontName, // Required.
      prependUnicode: true, // Recommended option.
      formats: ['ttf', 'eot', 'woff', 'woff2'], // Default, 'woff2' and 'svg' are available.
      timestamp: runTimestamp, // Recommended to get consistent builds when watching files.
      normalize: true, // The provided icons does not have the same height it could lead to unexpected results. Using the normalize option could solve the problem.
      fontHeight: 1001, // Stops the SVG being redrawn like a 3yo did them.. (https://github.com/nfroidure/gulp-iconfont/issues/138)
    }))
    .pipe(gulp.dest('./fonts/'));
});


// Favicons creation
var faviconDataFile = options.theme.css + 'favicon/faviconData.json';
// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('favicon', function(done) {
  realFavicon.generateFavicon({
    masterPicture: options.theme.css + 'master-favicon.svg',
    dest: options.theme.css + 'favicon/favicons',
    iconsPath: '/favicons/',
    design: {
      ios: {
        pictureAspect: 'noChange',
        assets: {
          ios6AndPriorIcons: false,
          ios7AndLaterIcons: false,
          precomposedIcons: false,
          declareOnlyDefaultIcon: true
        }
      },
      desktopBrowser: {},
      windows: {
        pictureAspect: 'noChange',
        backgroundColor: faviconBackgroundColour,
        onConflict: 'override',
        assets: {
          windows80Ie10Tile: false,
          windows10Ie11EdgeTiles: {
            small: false,
            medium: true,
            big: false,
            rectangle: false
          }
        }
      },
      androidChrome: {
        pictureAspect: 'noChange',
        themeColor: faviconColour,
        manifest: {
          display: 'standalone',
          orientation: 'notSet',
          onConflict: 'override',
          declared: true
        },
        assets: {
          legacyIcon: false,
          lowResolutionIcons: false
        }
      },
      safariPinnedTab: {
        pictureAspect: 'silhouette',
        themeColor: faviconColour
      }
    },
    settings: {
      scalingAlgorithm: 'Mitchell',
      errorOnImageTooSmall: true
    },
    markupFile: faviconDataFile
  }, function() {
    done();
  });
});
// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
// gulp.task('inject-favicon-markups', function() {
// 	return gulp.src([ 'TODO: List of the HTML files where to inject favicon markups' ])
// 		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(faviconDataFile)).favicon.html_code))
// 		.pipe(gulp.dest('TODO: Path to the directory where to store the HTML files'));
// });
// Check for updates on RealFaviconGenerator
// (ie: If Apple has just released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your CI.
gulp.task('check-for-favicon-update', function(done) {
  var currentVersion = JSON.parse(fs.readFileSync(faviconDataFile)).version;
  realFavicon.checkForUpdates(currentVersion, function(err) {
    if (err) {
      throw err;
    }
  });
});

// Clean all directories.
gulp.task('clean', ['clean:css', 'clean:js']);

// ********************************************************************************************************************************************


// Default gulp task.
gulp.task('default', ['clean', 'images', 'modernizr', 'styles:dev', 'js:build']);

// Development gulp task, kinda same as default
gulp.task('dev', ['clean', 'images', 'modernizr', 'styles:dev', 'js:build']);

// Production gulp task.
gulp.task('prod', ['clean', 'images', 'modernizr', 'styles:prod', 'js:build']);

// Watch changes.
gulp.task('watch', ['images', 'modernizr'], function() {
  // Watch for govkit Sass changes.
  gulp.watch([options.theme.sass + 'themes/govkit/*.scss'], ['styles:dev']);
  // Watch for partials Sass changes.
  gulp.watch([options.theme.sass + 'partials/*.scss'], ['styles:dev']);
  // Watch for JS changes.
  gulp.watch([options.theme.jsSrc + '*.js'], ['js:build']);
  // Watch for img optim changes.
  gulp.watch('./src/img/**', function() {
    gulp.start('images');
  });
  // Watch for font icon changes.
  gulp.watch('./src/font-icons/**', function() {
    gulp.start('iconFont');
  });
  // Watch for master Favicon changes.
  gulp.watch('./src/favicon/master-favicon.svg', function() {
    gulp.start('favicon');
  });
  // Once the favicons are built, create an optimised copy to use.
  gulp.watch('./src/favicon/favicons/**', function() {
    gulp.start('favicons');
  });
});
