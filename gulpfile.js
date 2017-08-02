const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const mocha = require('gulp-mocha');
const injectModules = require('gulp-inject-modules');
const istanbul = require('gulp-istanbul');
const coveralls = require('gulp-coveralls');
const nodemon = require('gulp-nodemon');
const exit = require('gulp-exit');

gulp.task('build', ['build-server', 'build-spec', 'build-app']);
gulp.task('default', ['build', 'serve', 'watch']);
gulp.task('tests', ['run-tests', 'coverage']);


gulp.task('watch', () => {
  gulp.watch(['./server/**', './app.js'], ['build']);
});

gulp.task('build-server', () => {
  gulp.src('server/**/*')
  .pipe(babel())
  .pipe(gulp.dest('./build/server'));
});

gulp.task('build-spec', () => {
  gulp.src('spec/**/*')
  .pipe(babel())
  .pipe(gulp.dest('./build/spec'));
});

gulp.task('build-app', () => {
  gulp.src('./app.js')
  .pipe(babel())
  .pipe(gulp.dest('./build'));
});

gulp.task('serve', () => {
  nodemon({
    script: './build/app.js',
    ext: 'js json',
    ignore: ['node_modules/', 'README.md'],
    watch: './build/'
  });
});

gulp.task('run-tests', () => {
  gulp.src('./build/spec/**/*.js')
  .pipe(injectModules())
  .pipe(mocha({
    timeout: 10000
  }))
  .pipe(exit());
});
