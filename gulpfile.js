const gulp = require('gulp'),
      sass = require('gulp-sass')(require('node-sass')),
      autoprefixer = require('gulp-autoprefixer'),
      cleanCSS = require('gulp-clean-css'),
      rename = require('gulp-rename'),
      minify = require('gulp-minify'),
      themeKit = require('@shopify/themekit'),
      dependents = require('gulp-dependents');


const sources = {
  scss: './src/scss/**/*.scss',
  js: './src/js/**/*.js',
  assets: './assets/'
}

function buildCss(cb) {
  return gulp.src(sources.scss, { since: gulp.lastRun(buildCss) })
    .pipe(dependents())
    .pipe(sass.sync({ outputStyle: 'extended'}).on('error', sass.logError))
    .pipe(autoprefixer({ cascade : false }))
    .pipe(cleanCSS())
    .pipe(rename((path) =>  {
      path.extname = ".min.css"
      path.dirname = ""
    }))
    .pipe(gulp.dest(sources.assets))
    .on('end', cb)
}

function buildJS() {
  return gulp.src(sources.js)
    .pipe(minify({
      ext:{
        min:'.min.js'
      },
      noSource: true
    }))
    .pipe(rename((path) =>  {
      path.dirname = ""
    }))
    .pipe(gulp.dest(sources.assets));
}



async function watchAll(done) {
  gulp.watch(sources.js, buildJS);
  gulp.watch(sources.scss, buildCss);
  
  themeKit.command('watch', {
    config: './config.yml',
    env: "development"
  })
  
  done();
}

exports.watch = gulp.series(watchAll);