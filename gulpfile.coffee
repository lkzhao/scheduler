
gulp = require 'gulp'
sourcemaps = require 'gulp-sourcemaps'
concat = require 'gulp-concat'
coffee = require 'gulp-coffee'
react = require 'gulp-react'
rename = require 'gulp-rename'
gulpif = require 'gulp-if'

staticRoot = "scheduler/static/"
lessRoot = "#{staticRoot}less/"
jsRoot = "#{staticRoot}js/"
jsxRoot = "#{staticRoot}jsx/"
coffeeRoot = "#{staticRoot}coffee/"


gulp.task 'helpers', ->
  gulp.src ["#{coffeeRoot}helpers.coffee"]
      .pipe sourcemaps.init()
      .pipe coffee()
      .pipe sourcemaps.write()
      .pipe gulp.dest(jsRoot)

gulp.task 'searchInput', ->
  gulp.src ["#{jsxRoot}searchInput.jsx"]
      .pipe sourcemaps.init()
      .pipe react()
      .pipe sourcemaps.write()
      .pipe gulp.dest(jsRoot)

gulp.task 'edit', ->
  gulp.src ["#{jsxRoot}edit.jsx"]
      .pipe sourcemaps.init()
      .pipe react()
      .pipe sourcemaps.write()
      .pipe gulp.dest(jsRoot)

gulp.task 'share', ->
  gulp.src ["#{coffeeRoot}share.coffee"]
      .pipe sourcemaps.init()
      .pipe coffee()
      .pipe sourcemaps.write()
      .pipe gulp.dest(jsRoot)

gulp.task 'basic', ['helpers', 'searchInput'], ->
  gulp.src ["#{jsRoot}helpers.js", "#{jsRoot}searchInput.js"]
      .pipe sourcemaps.init(loadMaps: yes)
      .pipe concat('basic.js')
      .pipe sourcemaps.write()
      .pipe gulp.dest(jsRoot)

gulp.task 'build', ['basic', 'edit', 'share', 'watch']
gulp.task 'default', ['build', 'watch']

gulp.task 'watch', ->
  gulp.watch ["#{coffeeRoot}*.coffee", "#{jsxRoot}*.jsx"], ['build']