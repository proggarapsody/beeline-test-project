let preprocessor = 'sass',
  fileswatch = 'html,htm,txt,json,md,woff2';

import pkg from 'gulp';
const { gulp, src, dest, parallel, series, watch } = pkg;

import browserSync from 'browser-sync';
import bssi from 'browsersync-ssi';
import ssi from 'ssi';
import webpackStream from 'webpack-stream';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import gulpSass from 'gulp-sass';
import dartSass from 'sass';

const sass = gulpSass(dartSass);
import sassglob from 'gulp-sass-glob';
import postCss from 'gulp-postcss';
import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';
import imagemin from 'gulp-imagemin';
import changed from 'gulp-changed';
import concat from 'gulp-concat';
import rsync from 'gulp-rsync';
import del from 'del';
import svgSprite from 'gulp-svg-sprite';
import path from 'path';

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/',
      middleware: bssi({ baseDir: 'app/', ext: '.html' }),
    },
    ghostMode: { clicks: false },
    notify: false,
    online: true,
  });
}

function scripts() {
  return src(['app/js/*.js', '!app/js/*.min.js'])
    .pipe(
      webpackStream(
        {
          mode: 'development',
          performance: { hints: false },
          plugins: [],
          module: {
            rules: [
              {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env'],
                    plugins: ['babel-plugin-root-import'],
                  },
                },
              },
            ],
          },
          optimization: {
            minimize: true,
            minimizer: [
              new TerserPlugin({
                terserOptions: { format: { comments: false } },
                extractComments: false,
              }),
            ],
          },
        },
        webpack
      )
    )
    .pipe(concat('app.min.js'))
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

function styles() {
  return src([`app/styles/${preprocessor}/*.*`, `!app/styles/${preprocessor}/_*.*`])
    .pipe(eval(`${preprocessor}glob`)())
    .pipe(eval(preprocessor)({ 'include css': true }))
    .pipe(
      postCss([
        autoprefixer({ grid: 'autoplace' }),
        cssnano({ preset: ['default', { discardComments: { removeAll: true } }] }),
      ])
    )
    .pipe(concat('app.min.css'))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

function svgSprites() {
  return src('./app/assets/images/dist/svg/*')
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../sprite.svg', //sprite file name
          },
        },
      })
    )

    .pipe(dest('./app/assets/images/dist/'));
}

function images() {
  return src(['app/assets/images/src/**/*'])
    .pipe(changed('app/assets/images/dist'))
    .pipe(imagemin())
    .pipe(dest('app/assets/images/dist'))
    .pipe(svgSprites())
    .pipe(browserSync.stream());
}

function buildcopy() {
  return src(
    [
      '{app/js,app/css}/*.min.*',
      'app/assets/images/**/*.*',
      '!app/assets/images/src/**/*',
      'app/assets/fonts/**/*',
    ],
    { base: 'app/' }
  ).pipe(dest('dist'));
}

async function cleandist() {
  cleanSvg();
  del('dist/**/*', { force: true });
}
async function cleanSvg() {
  del('app/assets/images/dist/svg/**/*', { force: true });
}

function deploy() {
  return src('dist/').pipe(
    rsync({
      root: 'dist/',
      hostname: 'username@yousite.com',
      destination: 'yousite/public_html/',
      // clean: true, // Mirror copy with file deletion
      include: [
        /* '*.htaccess' */
      ], // Included files to deploy,
      exclude: ['**/Thumbs.db', '**/*.DS_Store'],
      recursive: true,
      archive: true,
      silent: false,
      compress: true,
    })
  );
}

function startwatch() {
  watch(`app/styles/${preprocessor}/**/*`, { usePolling: true }, styles);
  watch(['app/js/**/*.js', '!app/js/**/*.min.js'], { usePolling: true }, scripts);
  watch('app/assets/images/src/**/*', { usePolling: true }, images);
  watch(`app/**/*.{${fileswatch}}`, { usePolling: true }).on('change', browserSync.reload);
}

export { scripts, styles, images, deploy };
export let assets = series(scripts, styles, images);
export let build = series(cleandist, images, scripts, styles, buildcopy);

export default series(scripts, styles, images, parallel(browsersync, startwatch));
