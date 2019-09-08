<!--
 * @Author: shiyao
 * @Description: 
 * @Date: 2019-08-22 09:03:04
 -->
# Router 路由

![border](https://user-gold-cdn.xitu.io/2018/5/8/1633d8c30a032a2d?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

[感谢这位大佬的图](https://juejin.im/post/5af108dc518825672565cf31#heading-0)

### 使用之后

在Vue实例上的$options 上有一个router就是VueRouter的实例，

当我们把router挂载到Vue上面之后看看有哪些变化。

* _router: this.$options.router **挂载的VueRouter的实例**

* _route: 是一个响应式的路由route对象，这个对象会存储我们路由信息，它是通过Vue提供的Vue.util.defineReactive来实现响应式的。该路由对象是不可变的，每次成功的导航都会产生一个新的对象

  ```javascript
  Vue.util.defineReactive(this, '_route', this._router.history.current);
  
  Object.defineProperty(Vue.prototype, '$route', {
    get() {
      return this._routerRoot._route;
    }
  })
  ```

  * $route.path

    字符串。 当前路由的路径。总是解析绝对路径 '/foo/bar'

  * $route.params

    一个 key/vaule 对象。 包含了动态片段和全匹配片段。如果没有参数就是一个空对象

  * $route.query

    一个空对象，表示URL查询参数。例如 对于路径 `/foo?user=1`，则有 `$route.query.user == 1`，如果没有查询参数，则是个空对象。

  * $route.hash

    当前路由的hash值。没有hash值就是空字符串

  * $route.fullPath

    解析后的URL，包含查询参数和hash的完整路径

  * $route.matched

    一个数组 包含当前路由所有嵌套路径片段的路由记录。

  * $route.name 

    当前路由的名称

    

  **$route对象是一个可读的属性，里面的属性是不可变的（immutable）不过可以watch检测他。**

  

* _routerRoot 指向我们的Vue根节点；

* _routerViewCache 是我们对View的缓存



**当VueRouter实例挂载到Vue上之后，VueRouter的实例中的constructor初始化了各种钩子队列。初始化了matcher用于我们的路由匹配逻辑并创建路由对象。初始化了history来执行过渡逻辑并执行钩子队列。 然后router里执行init初始化方法。 调用history对象的transitionTo方法，然后通过match获取当前路由匹配的数据并创建了一个新的路由对象route，接下来拿着这个route对象去执行confirmTransition方法去执行钩子队列中的事件。最后通过updateRoute更新存储当前路由数据的对象 current。指向刚才创建的路由对象route。 _route被定义为响应式之后 那么一个路由更新之后，_route对象接收到响应并通知RouteView去更新视图**



#### 源码目录

* component RouterLink 和RouterView 组件
* create-matcher match的入口
* Create-route-map 用于创建path列表。path map name map
* history 创建history类的逻辑。
* index.js 就是我们的入口文件
* utils 工具函数

## 路由注册

Vue本身是一个渐进式框架，本身是解决视图渲染的问题， 其他能力就通过插件的方式来解决。Vue-Router就是一个路由插件。

### Vue.use
Vue提供了 Vue.use的全局API来注册这些插件。
```javascript
export function initUse(Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    // 用来存插件的数组
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
    // 看看有没有安装这个插件
    if (installedPlugins.indexOf(plugin) > -1) {
      return this;
    }

    const args = toArray(arguments, 1);
    args.unshift(this);

    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args);
    }
    installedPlugins.push(plugin);
    return this;
  };
}
```

### 路由安装
Vue-Router 定义了 VueRouter类，实现了install 的静态方法。VueRouter.install = install;

```javascript
export let _Vue
export function install (Vue) {
  if (install.installed && _Vue === Vue) return
  // 该变量作为已安装的标志位
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    // 这里注入钩子函数
    beforeCreate () {
      if (isDef(this.$options.router)) {
        // Vue 作为 _routerRoot 自己
        this._routerRoot = this
        // _router 是VueRouter的实例
        this._router = this.$options.router
        this._router.init(this)
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        // 把每个组件的_routerRoot都会指向跟Vue实例
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  // 这里把 $router 挂到 Vue的原型上
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })
  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
```

### 实例化 VueRouter
```javascript
this.app = null;
  this.apps = [];
  this.options = options;
  this.beforeHooks = [];
  this.resolveHooks = [];
  this.afterHooks = [];
  // 创建match匹配函数
  this.matcher = createMatcher(options.routes || [], this);
  // 根据mode实例化具体的History
  var mode = options.mode || 'hash';
  this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false;
  if (this.fallback) {
    mode = 'hash';
  }
  if (!inBrowser) {
    mode = 'abstract';
  }
  this.mode = mode;

  switch (mode) {
    case 'history':
      this.history = new HTML5History(this, options.base);
      break
    case 'hash':
      this.history = new HashHistory(this, options.base, this.fallback);
      break
    case 'abstract':
      this.history = new AbstractHistory(this, options.base);
      break
  }
```
最重要的一步是创建 match匹配函数。

### match匹配函数
```javascript

```

## router-view 组件
router-view 是一个函数式组件，渲染路径匹配到视图组件。还可以嵌套自己的view。根据嵌套路径来渲染嵌套组件。
其他属性都直接传给渲染的组件。可以配合 transition 和 keep-alive 使用。有一个name属性，会渲染对应路由配置中components下相应的组件。

```javascript
export default {
  name: 'Router-view',
  functional: true,
  props: {
    name: {
      Type: String,
      default: 'default'
    }
  },
  render (_, { props, children, parent, data }) {

    data.routerView = true;

    const h = parent.$createElement;
    const name = props.name;
    const route = parent.$route;
    const cache = parent._routerViewCache || (parent._routerViewCache = {});

    let depth = 0;
    let inactive = false;

    while (parent && parent._routerRoot !== parent) {
      //     
    }
  }
};
```

