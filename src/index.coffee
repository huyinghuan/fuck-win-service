$async = require 'async'
$path = require 'path'
$exec = require('child_process').exec
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

  initAppPackage: ->
    packageJsonPath = $path.join process.cwd(), 'package.json'
    @appPackage = {} if not $fs.existsSync packageJsonPath
    @appPackage = require packageJsonPath

  initNssmLocation: ->
    nssmExec = if @checkArch("32") then "nssm.exe" else "nssm64.exe"
    @nssmLocation = $path.join __dirname, 'bin', nssmExec
    console.log @nssmLocation

  initExecLocation: ()->
    return @execLocation = @option.exec if @option.exec
    nodeExce = if @checkArch("32") then "node.exe" else "node64.exe"
    defExecLocation = $path.join process.cwd(), nodeExce
    @execLocation = defExecLocation
    console.log @execLocation

  checkArch: (arch)->
    systemArch = process.arch.match(/(32|64)/)[1]
    systemArch is arch

  checkIsWindowPlatForm: ->
    return false if process.platform isnt 'win32'
    return true

  # nssm install serviceName  command
  nssmExec: (operate, serviceName, command, cb) ->
    self = @
    cmd = "#{@nssmLocation} #{operate} #{command}"
    $exec cmd, (err, stdout, stderr) ->
      if stderr
        not self.option.silent and console.error(stderr)
      cb and cb(err or stderr)

  baseStep: ()->
    self = @
    [
      (next)->
        error = null
        if not self.checkIsWindowPlatForm()
          error = "only work in windows OS"
        next(error)
    ,(next)->
      $exec('NET SESSION', (err, stdout, stderror)->
        if err or (stderror.length isnt 0)
          next("No rights to manage services.")
        else
          next()
      )
    ]


  install: (cb)->

    serviceName = @option.name or  @appPackage.name

    console.log "serviceName", serviceName

    main = @option.main or @appPackage.main or ''

    main = $path.join process.cwd(), main

    main =  "#{main} #{@option.arg}" if @option.arg

    command = "#{@execLocation} #{main}"

    console.log "command", command

    self = @

    queue = @baseStep()

    #$async.series(queue, (err)-> cb and cb(err))
    #return

    queue.push((next)->
      self.nssmExec("install", serviceName, command, (err)->
        next err
      )
    )

    queue.push((next)->
      self.nssmExec('start', serviceName, '', (err)->
        next err
      )
    )

    $async.series(queue, (err)->
      cb(err)
    )

  uninstall: (cb)->

  start: (serviceName, cb)->

  stop: (serviceName, cb)->



module.exports = Nssm