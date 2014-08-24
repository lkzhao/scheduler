
gulp = require 'gulp'
sourcemaps = require 'gulp-sourcemaps'
concat = require 'gulp-concat'
coffee = require 'gulp-coffee'
jsx = require 'gulp-jsx'


staticRoot = "scheduler/static/"
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
  gulp.src ["#{jsxRoot}searchInput.js"]
      .pipe sourcemaps.init()
      .pipe jsx()
      .pipe sourcemaps.write()
      .pipe gulp.dest(jsRoot)

gulp.task 'editjsx', ->
  gulp.src ["#{jsxRoot}edit.js"]
      .pipe sourcemaps.init()
      .pipe jsx()
      .pipe sourcemaps.write()
      .pipe gulp.dest(jsRoot)

gulp.task 'basic', ['helpers', 'searchInput'], ->
  gulp.src ["#{jsRoot}helpers.js","#{jsRoot}searchInput.js"]
      .pipe sourcemaps.init(loadMaps: true)
      .pipe concat('basic.js')
      .pipe sourcemaps.write()
      .pipe gulp.dest(jsRoot)

gulp.task 'edit', ['basic', 'editjsx'], ->
  gulp.src ["#{jsRoot}basic.js", "#{jsRoot}edit.js"]
      .pipe sourcemaps.init(loadMaps: true)
      .pipe concat("edit.js")
      .pipe sourcemaps.write()
      .pipe gulp.dest(jsRoot)

gulp.task 'share', ['basic'], ->
  gulp.src "#{coffeeRoot}share.coffee"
      .pipe sourcemaps.init(loadMaps: true)
      .pipe concat("share.js")
      .pipe sourcemaps.write()
      .pipe gulp.dest(jsRoot)

gulp.task 'default', ['basic', 'edit', 'share']