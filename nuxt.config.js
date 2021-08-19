import pkg from './package'

export default {
  mode: 'spa',

  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  /*
   ** Global CSS
   */
  css: ['@/assets/stylus/main.styl'],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: ['@/plugins/element-ui', '@/plugins/main'],

  router: {
    middleware: 'auth'
  },

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios'
  ],
  /*
   ** Axios module configuration
   */

  axios: {
    proxy: true
    // See https://github.com/nuxt-community/axios-module#options
  },
  proxy: {
    '/japi': {
      target: 'https://www.douyu.com',
      pathRewrite: { '^/japi': '' }
    }
  },
  generate: {
    routes: [
      '/rank_list/frontend',
      '/rank_list/android',
      '/rank_list/backend',
      '/rank_list/ai',
      '/rank_list/ios',
      '/rank_list/freebie',
      '/rank_list/article'
    ],
    minify: {
      collapseWhitespace: false
    }
  },

  /*
   ** Build configuration
   */
  build: {
    transpile: [/^element-ui/],

    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
