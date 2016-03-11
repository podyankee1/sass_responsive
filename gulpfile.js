var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var jade          = require('gulp-jade');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var  imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');

var env,
	sassStyle;

env = process.env.NODE_ENV || 'development';

if (env==='development')
	{
	sassStyle = 'expanded';
} else {
	sassStyle = 'compressed';
}

var messages = {
	jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};


function customPlumber(errTitle) {
	return plumber({
	errorHandler: notify.onError({
		// Customizing error title
		title: errTitle || "Error running Gulp",
		message: "Error: <%= error.message %>",
	})
	});
}




gulp.task('browser-sync', ['sass'], function() {
	browserSync({
		server: {
			baseDir: '_site'
		},
		notify: false
	});
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
	return gulp.src('assets/css/main.scss')
		.pipe(customPlumber('Error Running Sass'))
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: sassStyle,
			includePaths: ['css'],
			onError: browserSync.notify
		}))
		.pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(sourcemaps.write('../maps'))
		.pipe(gulp.dest('_site/assets/css'))
		.pipe(browserSync.reload({stream:true}));
});




gulp.task('watch', function () {
	gulp.watch('assets/js/*.js', ['js']);
	gulp.watch('assets/css/**/*.sass', ['sass']);
	gulp.watch(['index.html', '_layouts/*.html', '_includes/*'], ['jekyll-rebuild']);
	gulp.watch(['_jadefiles/*.jade'], ['jade']);
	gulp.watch(['assets/img/**/*.*'], ['images']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['js','sass','jekyll-rebuild','jade','images','browser-sync', 'watch']);
