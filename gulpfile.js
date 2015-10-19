var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var purify = require('gulp-purifycss');
var minifyCSS = require('gulp-minify-css')

gulp.task('scripts', function() {
  return gulp.src(['client/public/js/*.js',
    'client/public/js/angular/*.js',
    'client/public/js/angular/controller/*.js',
    'client/public/js/angular/directives/*.js',
    'client/public/js/angular/services/*.js',])
    .pipe(concat('jquery.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('client/public/js'));
});

gulp.task('css', function() {
  return gulp.src(['client/bower_components/bootstrap/dist/css/bootstrap.css',
    'client/public/css/styles.css',
    'client/bower_components/angular-bootstrap-simple-chat/src/css/style.css',
    'client/bower_components/angular-bootstrap-simple-chat/src/css/themes.css'])
    .pipe(purify(['client/public/js/*.html', 'client/public/js/template/*.html']))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('client/public/css/mini-css'));
})

gulp.task('default', ['scripts', 'css']);
