## 项目介绍

**项目中整合 vue + nuxt + axios + vuex + vue-router (nuxt 自带 vuex 和 vue-router)，一个基于 Nuxt 的服务器端渲染**

## 项目构建步骤

``` bash
# 安装依赖
$ npm install # Or yarn install

# 启动服务，访问 localhost:3000
$ npm run dev

# 生成环境打包
$ npm run build
$ npm start

# 打包需要部署的静态页面
$ npm run generate
```

### 1、使用 starter 模板

使用的 `Nuxt` 官网提供的 starter 模板

```shell
npm install # Or yarn install
# 启动本地服务
npm run dev
```

访问 http://localhost:3000 

```shell
├── assets						css，图片等资源都在这
├── components                  组件相关
├── layouts                     路由布局
├── middleware                  中间件
├── pages                  		路由页面
├── static                  	静态资源
├── plugins                  		插件
├── store              	      	vuex 相关
├── nuxt.config.js              nuxt 相关配置
├── package.json              	依赖相关
├── README.md              	    项目介绍
```

`Nuxt` 会帮你将 pages 下面的文件自动解析成路由。pages 下面的每一个 vue 文件就是一个路由。

### 2、引入 axios

#### i. 安装依赖

```shell
npm i axios -S
```

#### ii. 封装 axios

在 `config.js` 中写入：

```javascript
import http from 'http'
import https from 'https'

export default {
  // 自定义的请求头
  headers: {
    post: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    'X-Requested-With': 'XMLHttpRequest'
  },
  // 超时设置
  timeout: 10000,
  // 跨域是否带Token
  withCredentials: true,
  // 响应的数据格式 json / blob /document /arraybuffer / text / stream
  responseType: 'json',
  // 用于node.js
  httpAgent: new http.Agent({
    keepAlive: true
  }),
  httpsAgent: new https.Agent({
    keepAlive: true
  })
}
```

在 `index.js` 中写入：

```javascript
import axios from 'axios'
import qs from 'qs'
import config from './config'

const service = axios.create(config)

service.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
// 返回结果处理
service.interceptors.response.use(
  res => {
    return res.data
  },
  error => {
    return Promise.reject(error)
  }
)

export default service
```

#### iii. 跨域处理

在 `Nuxt` 中你可以直接通过配置 `http-proxy-middleware`  来处理跨域。更幸运的是 `Nuxt` 官方提供了两个包来处理 `axios` 跨域问题。

- [@nuxtjs/axios](https://www.npmjs.com/package/@nuxtjs/axios)
- [@nuxtjs/proxy](https://www.npmjs.com/package/@nuxtjs/proxy)

首先，进行安装

```shell
npm i @nuxtjs/axios @nuxtjs/proxy -D
```

然后在 `nuxt.config.js` 文件里进行配置

```javascript
modules: [
  '@nuxtjs/axios'
],
axios: {
  proxy: true
},
proxy: {
  '/api': {
    target: 'xxx.target.com',
    pathRewrite: { '^/api': '' }
  }
}
```

这里需要注意，因为是服务器端渲染，我们得时刻明确当前地址是属于路由跳转还是属于 axios 请求。所以我们需要在 `service/index.js` 写入以下判断

```javascript
// 判断是路由跳转还是 axios 请求
if (process.server) {
  config.baseURL = `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`
}
```

### 3、管理 vuex

store 目录下需要的一些文件

```shell
├── actions.js                  axios 请求相关
├── index.js					主入口文件
├── mutations.js                同步状态操作相关
├── state.js                  	初始状态相关
```

```html
<template>
  <div class="page">
    <button @click="handleClick">{{ counter }}</button>
    <p>{{ banner.name }}</p>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  async asyncData ({ store, error }) {
    // 对 axios 进行批量处理
    let [ res ] = await Promise.all([
      store.dispatch('banner')
    ]).catch((e) => {
      error({ statusCode: 404, message: 'Post not found' })
    })
    return {
      banner: res.banner
    }
  },
  computed: {
    ...mapState({
      counter: state => state.counter
    })
  },
  methods: {
    ...mapMutations([
      'INCREMENT'
    ]),
    handleClick () {
      this.INCREMENT()
    }
  }
}
</script>
```

### 4、全局组件管理

`Nuxt` 的项目不比 `vue` 的项目，提供了主入口文件供我们对全局组件进行配置。但要做到这个点也比较简单，我们只需要按照 `Nuxt` 官网给出的规范来，将组件引入的相关配置写入到 plugins 目录下即可

比如，我需要引入三方组件库 [element-ui](https://github.com/ElemeFE/element) ，我们只需在 plugins 目录下新建一个 `element-ui.js` 文件，并写入

```javascript
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
```

然后在 `nuxt.config.js` 文件中引入

```javascript
plugins: [
  '~/plugins/element-ui'
]
```
当然，你想配置自己本地的全局组件，也是一样的做法。先在 plugins 目录下新建一个 js 文件，然后引入你的文件，最后再在 `nuxt.config.js` 文件中引入即可。

### 5、全局样式管理

和组件管理同理，不同的就是，css 需要存放在 assets 目录下。比如，现在我需要有一个 `main.css` 文件对路由跳转进行动态切换。

首选，你得在 `assets/main.css` 中写入重置样式吧

```css
.page-enter-active, .page-leave-active {
  transition: opacity .2s;
}

.page-enter, .page-leave-active {
  opacity: 0;
}
```

然后，你只要在 `nuxt.config.js` 进入引入即可

```
css: [
  '~/assets/stylus/main.styl'
]
```

详细请参考：[Nuxt.js 文档官网](https://zh.nuxtjs.org/)


## 三、项目部署

我们先看一下 `Nuxt` 提供的几个命令

| 命令            | 描述                                       |
| ------------- | ---------------------------------------- |
| nuxt          | 启动一个热加载的 Web 服务器（开发模式） [localhost:3000](http://localhost:3000/) |
| nuxt build    | 利用 webpack 编译应用，压缩 JS 和 CSS 资源（发布用）      |
| nuxt start    | 以生成模式启动一个 Web 服务器 (`nuxt build` 会先被执行)   |
| nuxt generate | 编译应用，并依据路由配置生成对应的 HTML 文件 (用于静态站点的部署)    |

### 1、静态化页面部署

我们从官网给出的文档可以看出，部署静态化页面需要用到的命令是 `nuxt generate` ，执行的时候会在根目录下面生成 dist 目录，里面的文件都是静态化页面需要的打包好的文件。

**这里需要特别注意的一点是，如果你的项目中存在 axios 请求的话，记得在你本地开启一个本地服务哦 ~ 不然打包的时候执行到 axios 请求的时候会报错。因为前面我们通过使用 node 的 process 对运行环境进行了是跳转还是请求的判定，而打包进行请求的时候是不依赖 node 环境的**
