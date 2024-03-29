
gulp = require 'gulp'
sourcemaps = require 'gulp-sourcemaps'
concat = require 'gulp-concat'
coffee = require 'gulp-coffee'
react = require 'gulp-react'
rename = require 'gulp-rename'
gulpif = require 'gulp-if'
gutil = require 'gulp-util'
staticRoot = "scheduler/static/"
lessRoot = "#{staticRoot}less/"
jsRoot = "#{staticRoot}js/"
jsxRoot = "#{staticRoot}jsx/"
coffeeRoot = "#{staticRoot}coffee/"

swallowError = (error) ->
  console.log error.toString()
  @emit 'end'

gulp.task 'coffee', ->
  gulp.src ["#{coffeeRoot}*.coffee"]
      .pipe sourcemaps.init()
      .pipe coffee()
      .on 'error', swallowError
      .pipe sourcemaps.write()
      .pipe gulp.dest(jsRoot)

gulp.task 'jsx', ->
  gulp.src ["#{jsxRoot}*.jsx"]
      .pipe sourcemaps.init()
      .pipe react()
      .on 'error', swallowError
      .pipe sourcemaps.write()
      .pipe gulp.dest(jsRoot)

gulp.task 'build', ['coffee', 'jsx']
gulp.task 'default', ['build', 'watch']

gulp.task 'watch', ->
  gulp.watch ["#{coffeeRoot}*.coffee", "#{jsxRoot}*.jsx"], ['build']