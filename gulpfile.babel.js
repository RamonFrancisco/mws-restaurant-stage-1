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
        styles: 'src/styles/**/*.scss',
        scripts: 'src/scripts/**/*.js',
        images: 'src/img/**/*.jpg',
        html: 'src/**/*.html'
    },
    build: {
        styles: 'build/css/',
        scripts: 'build/js/',
        images: 'build/img/',
        html: 'build/'
    }
}

const clean = () => del(['assets']);

const compileMarkup = () => {
    return gulp.src(paths.src.html)
        .pipe(gulp.dest(paths.build.html))
        .pipe(bs.stream());
}

const compileStyle = () => {
    return gulp.src(paths.src.styles)
        .pipe(sourceMaps.init() )
        .pipe(sass({outputStyle: 'compressed'})
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

const compile = gulp.series(clean, gulp.parallel([compileMarkup, compileStyle, compileScript]));
compile.description = 'compile all files'

const reload = (done) => {
    serve.reload;
    done();
}

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

const watchStyle = () => gulp.watch(paths.src.styles, gulp.series(compileStyle, compileMarkup));
const watchScript = () => gulp.watch(paths.src.scripts, gulp.series(compileScript, compileMarkup) );
const watchMarkup = () => gulp.watch(paths.src.html, compileMarkup);

const watch = gulp.parallel(watchMarkup, watchStyle, watchScript);
watch.description = 'watch for changes to all files'

const defaultTasks = gulp.parallel([serve, watch]);

export {
    compile,
    compileMarkup,
    compileScript,
    compileStyle,
    serve,
    watch,
    watchMarkup,
    watchScript,
    watchStyle
}

export default defaultTasks
