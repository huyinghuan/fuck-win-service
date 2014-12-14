(function() {
  var $async, $exec, $fs, $path, Nssm;

  $async = require('async');

  $path = require('path');

  $exec = require('child_process').exec;

  $fs = require('fs');


  /*
  
    option    [optional]
      name: "Service Name"
      exec: "Absolute Path to exec" #最好是绝对路径
      main: "index.js"
      arg: "-p 3000"
      silent: true # 是否打印错误信息 true：不打印
   */

  Nssm = (function() {
    function Nssm(option) {
      this.option = option != null ? option : {};
      this.initNssmLocation();
      this.initAppPackage();
      this.initExecLocation();
    }

    Nssm.prototype.initAppPackage = function() {
      var packageJsonPath;
      packageJsonPath = $path.join(process.cwd(), 'package.json');
      if (!$fs.existsSync(packageJsonPath)) {
        this.appPackage = {};
      }
      return this.appPackage = require(packageJsonPath);
    };

    Nssm.prototype.initNssmLocation = function() {
      var nssmExec;
      nssmExec = this.checkArch("32") ? "nssm.exe" : "nssm64.exe";
      this.nssmLocation = $path.join(__dirname, 'bin', nssmExec);
      return console.log(this.nssmLocation);
    };

    Nssm.prototype.initExecLocation = function() {
      var defExecLocation, nodeExce;
      if (this.option.exec) {
        return this.execLocation = this.option.exec;
      }
      nodeExce = this.checkArch("32") ? "node.exe" : "node64.exe";
      defExecLocation = $path.join(process.cwd(), nodeExce);
      this.execLocation = defExecLocation;
      return console.log(this.execLocation);
    };

    Nssm.prototype.checkArch = function(arch) {
      var systemArch;
      systemArch = process.arch.match(/(32|64)/)[1];
      return systemArch === arch;
    };

    Nssm.prototype.checkIsWindowPlatForm = function() {
      if (process.platform !== 'win32') {
        return false;
      }
      return true;
    };

    Nssm.prototype.nssmExec = function(operate, serviceName, command, cb) {
      var cmd, self;
      self = this;
      cmd = "" + this.nssmLocation + " " + operate + " " + command;
      return $exec(cmd, function(err, stdout, stderr) {
        if (stderr) {
          !self.option.silent && console.error(stderr);
        }
        return cb && cb(err || stderr);
      });
    };

    Nssm.prototype.baseStep = function() {
      var self;
      self = this;
      return [
        function(next) {
          var error;
          error = null;
          if (!self.checkIsWindowPlatForm()) {
            error = "only work in windows OS";
          }
          return next(error);
        }, function(next) {
          return $exec('NET SESSION', function(err, stdout, stderror) {
            if (err || (stderror.length !== 0)) {
              return next("No rights to manage services.");
            } else {
              return next();
            }
          });
        }
      ];
    };

    Nssm.prototype.install = function(cb) {
      var command, main, queue, self, serviceName;
      serviceName = this.option.name || this.appPackage.name;
      console.log("serviceName", serviceName);
      main = this.option.main || this.appPackage.main || '';
      main = $path.join(process.cwd(), main);
      if (this.option.arg) {
        main = "" + main + " " + this.option.arg;
      }
      command = "" + this.execLocation + " " + main;
      console.log("command", command);
      self = this;
      queue = this.baseStep();
      queue.push(function(next) {
        return self.nssmExec("install", serviceName, command, function(err) {
          return next(err);
        });
      });
      queue.push(function(next) {
        return self.nssmExec('start', serviceName, '', function(err) {
          return next(err);
        });
      });
      return $async.series(queue, function(err) {
        return cb(err);
      });
    };

    Nssm.prototype.uninstall = function(cb) {};

    Nssm.prototype.start = function(serviceName, cb) {};

    Nssm.prototype.stop = function(serviceName, cb) {};

    return Nssm;

  })();

  module.exports = Nssm;

}).call(this);
