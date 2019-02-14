import gulp from 'gulp';
import sass from 'gulp-sass';
import babel from 'gulp-babel';
import images from 'gulp-imagemin';
import uglify from 'gulp-uglify';
import sourceMaps from 'gulp-sourcemaps';
import del from 'del';
import bs from 'browser-sync';

const paths = {
    src: {
        data: 'src/data/**/*.json',
        html: 'src/**/*.html',
        images: 'src/img/**/*.jpg',
        styles: 'src/styles/**/*.scss',
        scripts: 'src/scripts/**/*.js',
        sw: 'src/sw/sw.js'
    },
    build: {
        data: 'build/data/',
        html: 'build/',
        images: 'build/img/',
        styles: 'build/css/',
        scripts: 'build/js/',
        sw: 'build/'
    }
}

const clean = () => del(['assets']);

const compileServiveWorker = () => {
    return gulp.src(paths.src.sw)
        .pipe(babel())
        .pipe(uglify())
        .pipe(gulp.dest(paths.build.sw));
}

const compileMarkup = () => {
    return gulp.src(paths.src.html)
        .pipe(gulp.dest(paths.build.html))
        .pipe(bs.stream());
}

const compileStyle = () => {
    return gulp.src(paths.src.styles)
        .pipe(sourceMaps.init() )
        .pipe(sass({
            outputStyle: 'compressed', 
            includePaths: ['src/styles']
        })
            .on('error', sass.logError))
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest(paths.build.styles))
        .pipe(bs.stream());
}

const compileScript = () => {
    return gulp.src(paths.src.scripts, { sourceMaps: true })
        .pipe(sourceMaps.init())
        .pipe(babel())
        .pipe(uglify())
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest(paths.build.scripts))
        .pipe(bs.stream());
}

const compileData = () => {
    return gulp.src(paths.src.data)
        .pipe(gulp.dest(paths.build.data));
}

const compileImage = () => {
    return gulp.src(paths.src.images)
        .pipe(images({
            progressive: true
        }))
        .pipe(gulp.dest(paths.build.images));
}

const compile = gulp.series(clean, gulp.parallel([
    compileServiveWorker,
    compileMarkup,
    compileStyle,
    compileScript,
    compileImage,
    compileData]));
compile.description = 'compile all files'

const serve = gulp.parallel(compile, () => {
    bs.create().init({
        files: 'build/**/*',
        server: {
            baseDir: ['./build']
        },
        port: 3002,
        reloadOnRestart: true
    });
});
serve.description = 'serve compiled source on local server at port 8888'

const watchSw = () => gulp.watch(paths.src.sw, gulp.series(compileServiveWorker, compileMarkup));
const watchImage = () => gulp.watch(paths.src.images, gulp.series(compileImage, compileMarkup));
const watchStyle = () => gulp.watch(paths.src.styles, gulp.series(compileStyle, compileMarkup));
const watchScript = () => gulp.watch(paths.src.scripts, gulp.series(compileScript, compileMarkup) );
const watchMarkup = () => gulp.watch(paths.src.html, compileMarkup);

const watch = gulp.parallel(watchMarkup, watchStyle, watchScript, watchImage, watchSw);
watch.description = 'watch for changes to all files'

const defaultTasks = gulp.parallel([serve, watch]);

export {
    compile,
    compileServiveWorker,
    compileMarkup,
    compileScript,
    compileStyle,
    serve,
    watch,
    watchSw,
    watchMarkup,
    watchScript,
    watchStyle
}

export default defaultTasks