var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

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

gulp.task('dependencies', function() {
  return gulp.src(['client/bower_components/jquery/dist/jquery.min.js',
    'client/public/bower_components/underscore/underscore-min.js',
    'client/public/bower_components/angular/angular.js',
    'client/public/bower_components/angular-ui-router/release/angular-ui-router.min.js',
    'client/public/bower_components/angular-svg-round-progressbar/build/roundProgress.min.js',
    'client/public/bower_components/angular-bootstrap-simple-chat/src/scripts/index.js'])
    .pipe(concat('dependencies.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('client/public/js'));
});

gulp.task('default', ['scripts', 'dependencies']);
