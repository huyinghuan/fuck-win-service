(function() {
  var $fs, $path, Nssm;

  $path = require('path');

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
      this.initService();
      this.buildInstallBat();
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
      return this.nssmLocation = $path.join(__dirname, 'bin', nssmExec);
    };

    Nssm.prototype.initExecLocation = function() {
      var defExecLocation, nodeExce;
      if (this.option.exec) {
        return this.execLocation = this.option.exec;
      }
      nodeExce = this.checkArch("32") ? "node.exe" : "node64.exe";
      defExecLocation = $path.join(process.cwd(), nodeExce);
      return this.execLocation = defExecLocation;
    };

    Nssm.prototype.initService = function() {
      var main;
      this.service = {};
      this.service.name = this.option.name || this.appPackage.name || 'node';
      main = this.option.main || this.appPackage.main || '';
      main = $path.join(process.cwd(), main);
      if (this.option.arg) {
        main = "" + main + " " + this.option.arg;
      }
      return this.service.command = "" + this.execLocation + " " + main;
    };

    Nssm.prototype.checkArch = function(arch) {
      var systemArch;
      systemArch = process.arch.match(/(32|64)/)[1];
      return systemArch === arch;
    };

    Nssm.prototype.buildInstallBat = function() {
      var queue;
      this.buildUninstallBat();
      this.buildRestartBat();
      this.buildStartBat();
      this.buildStopBat();
      queue = ["" + this.nssmLocation + " install " + this.service.name + " " + this.service.command, "" + this.nssmLocation + " start " + this.service.name];
      return this.writeBat('register.bat', queue);
    };

    Nssm.prototype.buildUninstallBat = function() {
      var queue;
      queue = ["" + this.nssmLocation + " stop " + this.service.name, "" + this.nssmLocation + " remove " + this.service.name];
      return this.writeBat('uninstall(卸载).bat', queue);
    };

    Nssm.prototype.buildRestartBat = function() {
      var queue;
      queue = ["" + this.nssmLocation + " restart " + this.service.name];
      return this.writeBat('restart(重启).bat', queue);
    };

    Nssm.prototype.buildStartBat = function() {
      var queue;
      queue = ["" + this.nssmLocation + " start " + this.service.name];
      return this.writeBat('start(启动).bat', queue);
    };

    Nssm.prototype.buildStopBat = function() {
      var queue;
      queue = ["" + this.nssmLocation + " stop " + this.service.name];
      return this.writeBat('close(关闭).bat', queue);
    };

    Nssm.prototype.writeBat = function(fileName, msgArr) {
      var index, value, _i, _len;
      for (index = _i = 0, _len = msgArr.length; _i < _len; index = ++_i) {
        value = msgArr[index];
        value = value.replace(/\\/g, "\\\\") + "\n";
        if (index === 0) {
          $fs.writeFileSync(fileName, value);
        } else {
          $fs.appendFileSync(fileName, value);
        }
      }
      return $fs.appendFileSync(fileName, "pause");
    };

    return Nssm;

  })();

  module.exports = Nssm;

}).call(this);
