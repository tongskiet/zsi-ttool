var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');


var sassFiles = './sass/**/*.scss';
gulp.task('compile-sass',function(){
   return gulp.src(sassFiles)
			  .pipe(sourcemaps.init())
              .pipe(sass({
				  errorLogToConsole: true
				  ,outputStyle :'compressed'
			  }))
			  .on('error',console.error.bind(console))
			  .pipe(
				autoprefixer({
				overrideBrowserslist: ['last 2 versions']
				,cascade: false
				})
			  )
			  .pipe(rename({suffix: '.min'}))
			  .pipe(sourcemaps.write('./'))
              .pipe(gulp.dest('//zsi-smager/wwwroot/lear_tt/css'))
			  .pipe(browserSync.stream())
	;

});

gulp.task('serve', function(){
	browserSync.init({
		server : './'
	});

	gulp.watch(sassFiles,gulp.parallel('compile-sass'));
	gulp.watch("./*.html").on('change',browserSync.reload);

});

gulp.task('watch-sass', function(){
	gulp.watch(sassFiles,gulp.parallel('compile-sass'));
});


gulp.task('copy-fa-fonts', function() {
   return gulp.src('./node_modules/components-font-awesome/webfonts/**/*.*')
   .pipe(gulp.dest('./webfonts'));

});

gulp.task('copy-js', function() {
   return gulp.src([
    './node_modules/jquery/dist/jquery.min.js'
   ,'./node_modules/bootstrap/dist/js/bootstrap.min.js'
   ,'./node_modules/handlebars/dist/handlebars.min.js'   
   ])
   .pipe(gulp.dest('./scripts'));

});

gulp.task('copy-all', gulp.parallel('copy-fa-fonts', 'copy-js'));
gulp.task('init', gulp.parallel('compile-sass', 'copy-all'));
gulp.task('default', gulp.series('compile-sass','serve'));
