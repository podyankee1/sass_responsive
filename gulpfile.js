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
var bourbon = require('node-bourbon');
bourbon.includePaths


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



/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
	browserSync.notify(messages.jekyllBuild);
	return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
		.on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
	browserSync.reload();
});


gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
	browserSync({
		server: {
			baseDir: 'dist'
		},
		notify: false
	});
});

gulp.task('js', function() {
	return gulp.src(['assets/js/functions.js'])
		.pipe(customPlumber('Error Running JS'))
		.pipe(gulpif(env === 'production', uglify()))
	.pipe(gulp.dest('dist/assets/js'))
		.pipe(browserSync.reload({stream:true}));
});



gulp.task('jade', function  () {
	return gulp.src('_jadefiles/*.jade')
	.pipe(customPlumber('Error Running JADE'))
	.pipe(jade({pretty: true}))
	.pipe(gulp.dest('_includes'));
});

/**
 * Compile files from _scss into both dist/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
	return gulp.src('assets/css/*.scss')
		.pipe(customPlumber('Error Running Sass'))
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: sassStyle,
			includePaths: require('node-bourbon').includePaths,
			onError: browserSync.notify
		}))
		.pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(sourcemaps.write('../maps'))
		.pipe(gulp.dest('dist/assets/css'))
		.pipe(gulp.dest('assets/css'))
		.pipe(browserSync.reload({stream:true}));
});


gulp.task('images', function() {
	gulp.src('assets/img/**/*.*')
	.pipe(gulpif(env === 'production', imagemin({
		progressive: true,
		svgoPlugins: [{ removeViewBox: false }]
	})))
	.pipe(gulpif(env === 'production', gulp.dest('dist/assets/img1')))
	.pipe(browserSync.reload({stream:true}));
});




/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
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
