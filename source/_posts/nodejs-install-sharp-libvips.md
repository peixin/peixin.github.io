---
uuid: e5b24a40-183d-11ea-9951-4b27dfb0f0c7
title: Node.js 安装 sharp libvips
urlname: nodejs-install-sharp-libvips
s: nodejs-install-sharp-libvips
date: 2019-12-06 23:34:31
tags:
    - nodejs
    - sharp
    - libvips
    - npm
    - yarn
categories:
coauthor: liupeixin
---
### 起因

当我们用 npm 或者 yarn 安装一些 node 库的时候，有时候会从Github或者AWS S3上下载一些编译好的二进制包。由于包大小或其他原因，往往下载不顺利。

比如今天  [sharp](https://github.com/lovell/sharp) 一个高效的resize图片的工具，它依赖 [libvips](https://github.com/libvips/libvips)。

> The typical use case for this high speed Node.js module is to convert large images in common formats to smaller, web-friendly JPEG, PNG and WebP images of varying dimensions.
> Resizing an image is typically 4x-5x faster than using the quickest ImageMagick and GraphicsMagick settings due to its use of libvips.



[libvips](https://github.com/libvips/libvips) 是一个用C实现的图片处理库，它提供了每个平台的二进制包，可以让你不必自己从源码编译。

>libvips is a demand-driven, horizontally threaded image processing library. Compared to similar libraries, libvips runs quickly and uses little memory. libvips is licensed under the LGPL 2.1+.



下面开始直接安装:

```bash
$ npm install sharp@0.23.1
> sharp@0.23.4 install /Users/xxx/xxx/xxx/node_modules/sharp
> (node install/libvips && node install/dll-copy && prebuild-install) || (node-gyp rebuild && node install/dll-copy)

info sharp Downloading https://github.com/lovell/sharp-libvips/releases/download/v8.8.1/libvips-8.8.1-darwin-x64.tar.gz
```

由于网络原因，然后就一直卡在那，卡了很久很久。也不知道文件有多大，也不知道进度如何。一天尝试了无数次，用了很多方法无果。



### 分析

想到了安装 [node-sass](https://github.com/sass/node-sass) 也会有类似的问题。不过 node-sass 给了好些option解决这个问题，比如配置 `SASS_BINARY_SITE` 或者 `SASS_BINARY_PATH` 环境变量。原理无非是从另外一个镜像站点下载binary或者直接从本机某个path读取。

看刚才报错，是sharp执行  script `node install/libvips` 直接去看[源码](https://github.com/lovell/sharp)  `package.json` 文件，有如下代码：

```json
// package.json

"scripts": {
    "install": "(node install/libvips && node install/dll-copy && prebuild-install) || (node-gyp rebuild && node install/dll-copy)"
  }
```

继续读文件 `install/libvips.js` 找到下面这么两句：

```javascript
// install/libvips.js

const minimumLibvipsVersion = libvips.minimumLibvipsVersion;
const distBaseUrl = process.env.npm_config_sharp_dist_base_url || process.env.SHARP_DIST_BASE_URL || `https://github.com/lovell/sharp-libvips/releases/download/v${minimumLibvipsVersion}/`;
```

看来有办法了，sharp 也提供了一些环境变量来解决下载binary的问题，如果不设置，则使用默认的github的url，也就是上面 install 卡住的那一句。

然后继续去找 minimumLibvipsVersion的定义，是从 `package.json` 的 `config.libvips` 里取的。顺便也看到了cachePath这个函数，说明它下载完在本机是有缓存的，默认路径是 `~/.npm/_libvips`。那这个问题就又多了一种解决方法。代码如下:

```javascript
// lib/libvips.js

const minimumLibvipsVersion = env.npm_package_config_libvips || /* istanbul ignore next */
  require('../package.json').config.libvips;

....

const cachePath = function () {
  const npmCachePath = env.npm_config_cache || /* istanbul ignore next */
    (env.APPDATA ? path.join(env.APPDATA, 'npm-cache') : path.join(os.homedir(), '.npm'));
  mkdirSync(npmCachePath);
  const libvipsCachePath = path.join(npmCachePath, '_libvips');
  mkdirSync(libvipsCachePath);
  return libvipsCachePath;
};
```

```json
// package.json

"config": {
    "libvips": "8.8.1"
  },
```



### 解决方案

至此可以说，问题解决了。我们只要找到这个binary的镜像站，或者用一些下载工具从GitHub下载存到缓存地址就行。这里我想到了 [taobao npm mirror](https://npm.taobao.org/mirrors)，搜索了下果然有 [sharp-libvips](https://npm.taobao.org/mirrors/sharp-libvips/)



####  手动下载文件到缓存目录安装

根据libvips版本，本机系统找到下载地址 `https://npm.taobao.org/mirrors/sharp-libvips/v8.8.1/libvips-8.8.1-darwin-x64.tar.gz`

```bash
$ wget https://npm.taobao.org/mirrors/sharp-libvips/v8.8.1/libvips-8.8.1-darwin-x64.tar.gz .
$ mkdir -p ~/.npm/_libvips
$ mv libvips-8.8.1-darwin-x64.tar.gz ~/.npm/_libvips

$ npm install

> sharp@0.23.4 install /Users/xxx/xxx/xxx/node_modules/sharp
> (node install/libvips && node install/dll-copy && prebuild-install) || (node-gyp rebuild && node install/dll-copy)

info sharp Using cached /Users/xxx/.npm/_libvips/libvips-8.8.1-darwin-x64.tar.gz
added 2 packages from 60 contributors in 20.746s

```
Using cache 安装成功。



####  设置环境变量从 taobao mirror 下载安装 (推荐)
```bash
$ SHARP_DIST_BASE_URL=https://npm.taobao.org/mirrors/sharp-libvips/v8.8.1/ npm install

> sharp@0.23.4 install /Users/xxx/xxx/xxx/node_modules/sharp
> (node install/libvips && node install/dll-copy && prebuild-install) || (node-gyp rebuild && node install/dll-copy)

info sharp Downloading https://npm.taobao.org/mirrors/sharp-libvips/v8.8.1/libvips-8.8.1-darwin-x64.tar.gz
added 2 packages from 60 contributors in 38.494s
```
Downloading 安装成功。
