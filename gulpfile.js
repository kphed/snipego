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
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('client/public/js'));
});

gulp.task('default', ['scripts']);
