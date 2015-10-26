'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');
var concatCSS = require('gulp-concat-css');
var minifyHTML = require('gulp-minify-html');

gulp.task('scripts', function() {
  return gulp.src(['client/public/js/*.js',
    'client/public/js/angular/*.js',
    'client/public/js/angular/controller/*.js',
    'client/public/js/angular/directives/*.js',
    'client/public/js/angular/services/*.js',])
    .pipe(concat('jquery.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('client/public/js/mini'));
});

gulp.task('css', function() {
  return gulp.src(['client/public/css/styles.css'])
    .pipe(concat('style.css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifyCSS())
    .pipe(gulp.dest('client/public/css/'));
});

gulp.task('html', function() {
  return gulp.src(['client/public/index-unminified.html'])
    .pipe(minifyHTML())
    .pipe(gulp.dest('client/public/'));
});

gulp.task('default', ['scripts', 'css', 'html']);
