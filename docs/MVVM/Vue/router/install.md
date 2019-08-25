<!--
 * @Author: shiyao
 * @Description: 
 * @Date: 2019-08-22 09:03:04
 -->
# Router 路由

![border](https://user-gold-cdn.xitu.io/2018/5/8/1633d8c30a032a2d?imageView2)



[感谢这位大佬的图](https://juejin.im/post/5af108dc518825672565cf31#heading-0)

### 使用之后

在Vue实例上的$options 上有一个router就是VueRouter的实例，



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

