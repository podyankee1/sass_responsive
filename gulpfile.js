var gulp        = require('gulp'),
 browserSync = require('browser-sync'),
 sass        = require('gulp-sass'),
 prefix      = require('gulp-autoprefixer'),
 cp          = require('child_process'),
 jade          = require('gulp-jade'),
 del         = require('del'),
 concat = require('gulp-concat'),
 uglify = require('gulp-uglify'),
 gulpif = require('gulp-if'),
 rename = require('gulp-rename'),
 sourcemaps = require('gulp-sourcemaps'),
 plumber = require('gulp-plumber'),
 notify = require('gulp-notify'),
  imagemin = require('gulp-imagemin'),
 pngcrush = require('imagemin-pngcrush'),
 bourbon = require('node-bourbon');
 bourbon.includePaths


var env,
	  sassStyle,
    sassSources,
    jadeSources,
    imgSources,
    jsSources;

env = process.env.NODE_ENV || 'development';
sassSources = ['assets/css/'];
jadeSources = ['_jadefiles/*.jade'];
imgSources = ['assets/img/**/*.*'];
jsSources  = ['assets/libs/jquery/dist/jquery.min.js','assets/libs/magnific-popup/dist/jquery.magnific-popup.min.js']

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


gulp.task('browser-sync', [ 'sass', 'jekyll-build'], function() {
	browserSync({
		server: {
			baseDir: 'dist'
		},
		notify: false
	});
});

gulp.task('libs_js', function() {
	return gulp.src(jsSources)
		.pipe(customPlumber('Error Running JS'))
		.pipe(concat('libs.min.js'))
	  .pipe(gulp.dest('assets/js'))
});

gulp.task('js', function() {
	return gulp.src(['assets/js/libs.min.js', 'assets/js/functions.js'])
		.pipe(customPlumber('Error Running JS'))
		.pipe(gulpif(env === 'production', uglify()))
	  .pipe(gulp.dest('dist/assets/js'))
		.pipe(browserSync.reload({stream:true}))
});


gulp.task('jade', function  () {
	return gulp.src(jadeSources)
	.pipe(customPlumber('Error Running JADE'))
	.pipe(jade({pretty: true}))
	.pipe(gulp.dest('_includes'));
});

/**
 * Compile files from _scss into both dist/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
	return gulp.src(sassSources+"*.scss")
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
    .pipe(browserSync.reload({stream:true}))
    del.sync(['dist/assets/css/*.scss','dist/assets/libs','dist/assets/maps']);
});


gulp.task('images', function() {
	gulp.src(imgSources)
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
	gulp.watch(sassSources+'**/*.sass', ['sass']);
	gulp.watch(['index.html', '_layouts/*.html', '_includes/*'], ['jekyll-rebuild']);
	gulp.watch(['_jadefiles/*.jade'], ['jade']);
  gulp.watch(jsSources, ['libs_js']);
  gulp.watch(['assets/js/*.js'], ['js']);
	gulp.watch(['assets/img/**/*.*'], ['images']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
  gulp.task('default', ['sass','jekyll-rebuild','jade','libs_js','js','images','browser-sync', 'watch']);
