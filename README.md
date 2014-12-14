fuck-win-service
-----------------
Base on (nssm.exe)[http://nssm.cc/commands].   generate .bat file to register windows Service.
基于nssm 生产window 注册服务。

Note!!! Only work in windows. Don't support linux , mac os.

为什么？
通常我们需要部署到node服务在客户端的机器上，希望提供像一般软件的安装方式，能让用户一键安装。

## Install


```
npm install fuck-window-service --save
```

## Getting start
1. 假设现在你已经完成了一个工程了。 只差部署了。那么可能可以按下面步骤操作
在应用目录下面：
```
npm install fuck-window-service --save
```

2. 将node.exe(32位系统的)可执行文件（64位系统请更改名字为node64.exe）
放到应用根目录下，或者准备 32 位和64位的可执行文件 node.exe , node64.exe 都放在应用的根目录下面。
因为客户机上不一定带有node的环境，因此需要他们。

3.  然后在应用个目录下 新建一个js文件，命名随意，这里 叫 register.js
内容如下：
```
winser = require(fuck-window-service)
new winser()
```

4. 然后在应用根目录下写一个bat文件。如安装.bat 或者install.bat

```
node.exe register.js
register.bat
```

到此，开发工作已经完成了。

你只需要将你的工程拷贝到客户机上。然后告诉客户说，点击install.bat进行安装即可。

如果你想提升逼格。可以将bat文件通过工具bat to exe covert 转成exe文件。
让用户点这个也行。该工具请百度。一堆。

## 说明

1. 安装的服务名称 和package.json里面的name名称一样

2. 安装的服务，默认启动的是package.json里面的main指向的文件。

3. 卸载等工具会在安装完成后自动生成。

4. 如果你想自己指定其他程序作为注册服务，也就是不用pacakge.json和node.exe，
那么你可以在构造函数里面加选项就行配置。

如：
```coffeescript
###
  option    [optional]
    name: "Service Name" #服务的名称 可选。默认名称为 node
    exec: "Absolute Path to exec" #最好是绝对路径 必须
    main: "index.js" #主文件 可选
    arg: "-p 3000" #其他一些参数 可选
    silent: true # 是否打印错误信息 true：不打印 可选
###

new winser(opion)

```

##BUG

如果有bug 请反馈或者PR