process.env.UV_THREADPOOL_SIZE = 100;
var gulp = require('gulp');
var inject = require('gulp-inject');
var jade = require('gulp-jade');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var webpack = require('webpack-stream');
var foreach = require('gulp-foreach');
var watch = require('gulp-watch');

var fs = require('fs');
var path = require('path');
var browserSync = require('browser-sync').create();
var merge = require('merge2');
var named = require('vinyl-named');
var _webpack = require('webpack');

var childProcess = require('child_process');
var exec = childProcess.exec;

var childProcesses = [];

// To be set later in the server task
var restartNodeProcess = null;
/**
 * Restart node
 * @return {Function}
 */
var restartNode = function() {
  var tap = require('gulp-tap');
  return tap(function() {
    restartNodeProcess && restartNodeProcess();
  });
};

function tapDone(cb) {
  var tap = require('gulp-tap');
  return tap(function() {
    cb && cb();
    cb = null;
  });
}

var lastTime = Date.now();
var reloadTimer = null;
function reloadBrowserSync() {
  if (reloadTimer) {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(function() {
      browserSync.reload();
      reloadTimer = null;
      lastTime = Date.now();
    }, 125);

    return;
  }

  if (Date.now() - lastTime > 100) {

    reloadTimer = setTimeout(function() {
      browserSync.reload();
      reloadTimer = null;
      lastTime = Date.now();
    }, 125);

  }
}

function removeFileHandler(fromPath, targetPath, extensionTransforms) {
  var transforms = (extensionTransforms || []).map(function(transform) {
    return [new RegExp('\\.' + transform[0] + '$'), '.' + transform[1]];
  });

  return function(filePath) {
    var relativePath = path.relative(__dirname + '/' + fromPath, filePath);
    var removePath = path.resolve(__dirname + '/' + targetPath + '/' + relativePath);
    transforms.forEach(function(transform) {
      removePath = ''.replace.apply(removePath, transform);
    });

    fs.unlink(removePath, function(err) {
      if (err) {
        console.error('[Removed File]', err);
      } else {
        console.log('[Removed File]', removePath);
      }
    });
  };
}

/**
 *
 *
 *
 *  CONFIGURATIONS
 *
 *
 *
 */

var serverErrorHandler = function(err) {
  this.emit('end');
};

/**
 * Task for generating the scripts in production mode.
 */
gulp.task('server-scripts', function() {
  return merge(
    gulp.src(['server/**/*', 'package.json']).pipe(gulp.dest('dist')),
    gulp.src(['bin/**/*']).pipe(gulp.dest('dist/bin'))
  );
});

/**
 * Task for generating the scripts in development. Has sourcemaps for generated scripts
 */
gulp.task('server-scripts-dev', function(cb) {
  merge(
    gulp.src(['server/**/*', 'package.json'], {})
      .pipe(watch(['server/**/*', 'package.json'], {verbose: true}))
      .pipe(gulp.dest('build'))
      .pipe(tapDone(cb))
      .pipe(restartNode()),
    gulp.src(['bin/**/*'], {})
      .pipe(watch(['bin/**/*'], {read: false, verbose: true}))
      .pipe(gulp.dest('build/bin'))
      .pipe(restartNode())
  );
});

/**
 *
 * Scripts tasks
 *
 */
var scriptsErrorHandler = function(err) {
  console.log('[scripts] ', err);
  this.emit('end');
};

gulp.task('client-scripts-dev', function(cb) {
  var webpackConfig = require('./webpack.config');

  // Configure webpack to watch for changes
  gulp.src('')
    .pipe(plumber({
      errorHandler: scriptsErrorHandler,
    }))

    // .pipe(named()) // used named for following the naming convention for files
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('build/public/js'))
    .pipe(tapDone(cb));
});

gulp.task('client-scripts', function() {
  var webpackConfig = require('./webpack.config');

  // do not use any dev tool (namely the sourcemap tool)
  delete webpackConfig.devtool;
  delete webpackConfig.watch;

  // configure plugin to uglify js
  webpackConfig.plugins = (webpackConfig.plugins || []).concat([

    new _webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
  ]);

  return gulp.src('')
    .pipe(plumber({
      errorHandler: scriptsErrorHandler,
    }))
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('dist/public/js'));
});

/**
 *
 * Html tasks
 *
 */

var htmlErrorHandler = function(err) {
  console.log('[jade] ', err.toString());
};

gulp.task('client-html-dev', function(cb) {
  var injectConfig = require('./config/inject').dev;
  gulp.src('client/**/*.jade')
    .pipe(watch('client/**/*.jade'))
    .on('change', reloadBrowserSync)
    .on('unlink', removeFileHandler('client', 'build/public', [['jade', 'html']]))
    .pipe(foreach(function(stream, file) {
      var baseFileName = path.basename(file.path);
      var hasInject = injectConfig[baseFileName];
      if (hasInject) {
        return stream
          .pipe(inject(gulp.src(hasInject)));
      } else {
        return stream;
      }
    }))
    .pipe(plumber({
      errorHandler: htmlErrorHandler,
    }))
    .pipe(jade({
      pretty: true,
    }))
    .pipe(gulp.dest('build/public'))
    .pipe(tapDone(cb));
});

gulp.task('client-html', function() {
  var minifyHtml = require('gulp-minify-html');
  var injectConfig = require('./config/inject').dist;
  return gulp.src('client/**/*.jade')
    .pipe(foreach(function(stream, file) {
      var baseFileName = path.basename(file.path);
      var hasInject = injectConfig[baseFileName];
      if (hasInject) {
        return stream
          .pipe(inject(gulp.src(hasInject)));
      } else {
        return stream;
      }
    }))
    .pipe(plumber({
      errorHandler: htmlErrorHandler,
    }))
    .pipe(jade({
      data: {
        dist: true,
      },
    }))
    .pipe(minifyHtml({
      empty: true,
      cdata: true,
      conditionals: true,
    }))
    .pipe(gulp.dest('dist/public'));

});

/**
 *
 * Sass/css tasks
 *
 */
var sassErrorHandler = function(err) {
  console.log(err);
  console.log('[sass] ', err.messageFormatted);
  this.emit('end');
};

gulp.task('client-css-dev', function(cb) {
  merge(gulp.src('client/**/*.scss')
    .pipe(watch('client/**/*.scss'))
    .pipe(plumber({
      errorHandler: sassErrorHandler,
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/public'))
    .pipe(tapDone(cb))
    .pipe(browserSync.stream()),

    // copy over for sourcemaps
    gulp.src('client/css/**/*.scss')
    .pipe(watch('client/css/**/*.scss'))
    .pipe(gulp.dest('build/public/source'))
  );
});

gulp.task('client-css', function() {
  var minifyCss = require('gulp-minify-css');
  return gulp.src('client/**/*.scss')
    .pipe(plumber({
      errorHandler: sassErrorHandler,
    }))
    .pipe(sass())

    // .pipe(minifyCss())
    .pipe(gulp.dest('dist/public'));
});

gulp.task('copy-assets-dev', function(cb) {
  gulp.src('client/assets/**/*', {read: false})
    .pipe(watch('client/assets/**/*', {read: false, verbose: true}))
    .on('change', reloadBrowserSync)
    .on('unlink', removeFileHandler('client/assets', 'build/public/assets'))
    .pipe(gulp.dest('build/public/assets'))
    .pipe(tapDone(cb));
});

gulp.task('copy-assets', [], function() {
  return gulp.src('client/assets/**/*')
    .pipe(gulp.dest('dist/public/assets'));
});

gulp.task('start-database', [], function(cb) {
  // make the database directory if it doesn't already exist
  fs.mkdir('./database', function() {
    // run mongod
    var mongodProcess = childProcess.spawn('mongod', ['--dbpath=database'], {
      cwd: process.cwd(),
    });
    childProcesses.push(mongodProcess);

    var once = false;
    var mongoDataListener = function(data) {
      // check for textual acknowledgement that the mongo database daemon is
      // started and listening
      if (!once && ~data.toString().indexOf('waiting for connections on port 27017')) {
        cb();
        once = true;
        this.removeListener('data', mongoDataListener);
        console.log('\x1b[92m == Mongo database started and listening on 27017 == ');
      }
    };

    mongodProcess.stdout.on('data', mongoDataListener);

  });

});

gulp.task('start-redis', [], function(cb) {
  // make the database directory if it doesn't already exist
  // run mongod
  childProcesses.push();
  var redisProcess = childProcess.spawn('redis-server', [], {
    cwd: process.cwd(),
  });

  var once = false;
  var redisListener = function(data) {
    console.log(data.toString());

    // check for textual acknowledgement that the mongo database daemon is
    // started and listening
    if (!once && ~data.toString().indexOf('The server is now ready to accept connections on port 6379')) {
      cb();
      once = true;
      this.removeListener('data', redisListener);
      console.log('\x1b[92m == Redis started and listening on 6379 == ');
    }
  };

  redisProcess.stdout.on('data', redisListener);

});

gulp.task('client', ['copy-assets-dev', 'client-html-dev', 'client-css-dev', 'client-scripts-dev']);

gulp.task('server', ['server-scripts-dev', 'start-database'], function(cb) {
  var nodemon = require('gulp-nodemon');
  var active = false;
  nodeProcess = nodemon({
      script: 'build',
      ext: '',
      ignore: ['*.*'],
      watch: 'build',
      delay: Infinity,
      stdout: false,
      events: {
        restart: 'osascript -e \'display notification "Server restarted" with title "Mean stack"\'',
      },
    })
    .on('stdout', function(data) {
      process.stdout.write(data);
      if (!active && data.toString().indexOf('listening')) {
        cb && cb();
        cb = null;
        active = true;
        reloadBrowserSync();
      }
    })
    .on('stderr', function(data) {
      process.stderr.write(data);
    })
    .on('restart', function() {
      active = false;
    });

  restartNodeProcess = function() {
    if (active) nodeProcess.emit('restart');
  };
});

gulp.task('browser-sync', ['client', 'server'], function() {
  // initialize
  browserSync.init({
    proxy: 'localhost:3000',
    port: 5000,
  });
});

gulp.task('watch', ['browser-sync']);

gulp.task('default', ['watch']);

gulp.task('clean', function(cb) {
  var del = require('del');
  return del(['dist'], function(err, paths) {
    if (paths) console.log('Deleted files/folders:\n', paths.join('\n'));
    cb();
  });
});

gulp.task('clean-all', function(cb) {
  var del = require('del');
  return del(['build', 'dist'], function(err, paths) {
    if (paths) console.log('Deleted files/folders:\n', paths.join('\n'));
    cb();
  });
});

gulp.task('clean-build', ['clean'], function() {
  gulp.start('server-scripts', 'client-scripts', 'client-html', 'client-css', 'copy-assets');
});

process.on('uncaughtException', function(err) {
  childProcesses.forEach(function(c) {
    c.kill();
  });
});
