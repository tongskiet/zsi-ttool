var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var gulpSequence = require('gulp-sequence')

gulp.task('compile-sass',function(){
   return gulp.src('./sass/*.scss')
              .pipe(sass({
				  errorLogToConsole: true
				  ,outputStyle :'compressed'				  
			  }))
			  .on('error',console.error.bind(console))
			  .pipe( rename({suffix: '.min'}))
              .pipe(gulp.dest('./css'))
	;

});


gulp.task('copy-fa-fonts', function() {
   return gulp.src('./bower_components/components-font-awesome/webfonts/**/*.*')
   .pipe(gulp.dest('./webfonts'));

});

gulp.task('copy-js', function() {
   return gulp.src([
    './bower_components/jquery/dist/jquery.min.js'
   ,'./bower_components/bootstrap/dist/js/bootstrap.min.js'
   ,'./bower_components/handlebars/handlebars.min.js'   
   ])
   .pipe(gulp.dest('./scripts'));

});


gulp.task('copy-all', gulp.parallel('copy-fa-fonts', 'copy-js'));

