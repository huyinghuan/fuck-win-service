$path = require 'path'
$fs = require 'fs'
###
  option    [optional]
    name: "Service Name"
    exec: "Absolute Path to exec" #最好是绝对路径
    main: "index.js"
    arg: "-p 3000"
    silent: true # 是否打印错误信息 true：不打印
###

class Nssm
  constructor: (@option = {})->
    @initNssmLocation()
    @initAppPackage()
    @initExecLocation()
    @initService()
    @buildInstallBat()

  initAppPackage: ->
    packageJsonPath = $path.join process.cwd(), 'package.json'
    @appPackage = {} if not $fs.existsSync packageJsonPath
    @appPackage = require packageJsonPath

  initNssmLocation: ->
    nssmExec = if @checkArch("32") then "nssm.exe" else "nssm64.exe"
    @nssmLocation = $path.join __dirname, 'bin', nssmExec


  initExecLocation: ()->
    return @execLocation = @option.exec if @option.exec
    nodeExce = if @checkArch("32") then "node.exe" else "node64.exe"
    defExecLocation = $path.join process.cwd(), nodeExce
    @execLocation = defExecLocation

  initService: ()->
    @service = {}
    @service.name = @option.name or  @appPackage.name or 'node'

    main = @option.main or @appPackage.main or ''
    main = $path.join process.cwd(), main
    main =  "#{main} #{@option.arg}" if @option.arg
    @service.command = "#{@execLocation} #{main}"


  checkArch: (arch)->
    systemArch = process.arch.match(/(32|64)/)[1]
    systemArch is arch

  buildInstallBat: ->
    #生成卸载等bat文件
    @buildUninstallBat()
    @buildRestartBat()
    @buildStartBat()
    @buildStopBat()

    queue = [
      "#{@nssmLocation} install #{@service.name} #{@service.command}" #注册服务命令
      "#{@nssmLocation} start #{@service.name}"
    ]
    @writeBat('register.bat', queue)

  buildUninstallBat: ->
    queue = [
      "#{@nssmLocation} stop #{@service.name}"
      "#{@nssmLocation} remove #{@service.name}"
    ]
    @writeBat('uninstall(卸载).bat', queue)

  buildRestartBat: ->
    queue = [
      "#{@nssmLocation} restart #{@service.name}"
    ]
    @writeBat('restart(重启).bat', queue)

  buildStartBat: ->
    queue = [
      "#{@nssmLocation} start #{@service.name}"
    ]
    @writeBat('start(启动).bat', queue)

  buildStopBat: ->
    queue = [
      "#{@nssmLocation} stop #{@service.name}"
    ]
    @writeBat('close(关闭).bat', queue)

  writeBat: (fileName, msgArr)->
    for value, index in msgArr
      value = value.replace(/\\/g, "\\\\") + "\n"
      if index is 0
        $fs.writeFileSync fileName, value
      else
        $fs.appendFileSync fileName, value
    $fs.appendFileSync fileName, "pause"

module.exports = Nssm