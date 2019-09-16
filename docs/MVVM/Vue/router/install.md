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

## matcher

```javascript
export type Matcher = {
  match: (raw: RawLocation, current?: Route, redirectedFrom?: Location) => Route;
  addRoutes: (routes: Array<RouteConfig>) => void;
};
```

Matcher 返回两个方法，match和addRoutes，match是用来做匹配的，那么是匹配什么的。**路由里面有两个重要的概念，Location和Route**



#### Location

它是对url的结构化描述。

```javascript
declare type Location = {
  _normalized?: boolean;
  name?: string;
  path?: string;
  hash?: string;
  query?: Dictionary<string>;
  params?: Dictionary<string>;
  append?: boolean;
  replace?: boolean;
}
```

Route表示的是路由中的一条线，里面有一些对象属性。有匹配到的RouteRecord。



## createMatcher

```javascript
// routes 路由配置
// router router的实例
export function createMatcher (
  routes: Array<RouteConfig>,
  router: VueRouter
): Matcher {
  /**
   * pathList 是根据routes生成的path数组 ['', '/home', '/home/list']
   * pathMap 是根据path的名称生成的map
   * nameMap 如果在路由上配置了name 就会有这个name的map 跟pathMap是一样的结果值
   */
  const { pathList, pathMap, nameMap } = createRouteMap(routes)
  
  function addRoutes (routes) {
    createRouteMap(routes, pathList, pathMap, nameMap)
  }

  function match (
    raw: RawLocation,
    currentRoute?: Route,
    redirectedFrom?: Location
  ): Route {
    const location = normalizeLocation(raw, currentRoute, false, router)
    const { name } = location

    if (name) {
      const record = nameMap[name]
      if (process.env.NODE_ENV !== 'production') {
        warn(record, `Route with name '${name}' does not exist`)
      }
      if (!record) return _createRoute(null, location)
      const paramNames = record.regex.keys
        .filter(key => !key.optional)
        .map(key => key.name)

      if (typeof location.params !== 'object') {
        location.params = {}
      }

      if (currentRoute && typeof currentRoute.params === 'object') {
        for (const key in currentRoute.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key]
          }
        }
      }

      location.path = fillParams(record.path, location.params, `named route "${name}"`)
      return _createRoute(record, location, redirectedFrom)
    } else if (location.path) {
      location.params = {}
      for (let i = 0; i < pathList.length; i++) {
        const path = pathList[i]
        const record = pathMap[path]
        if (matchRoute(record.regex, location.path, location.params)) {
          return _createRoute(record, location, redirectedFrom)
        }
      }
    }
    // no match
    return _createRoute(null, location)
  }

  function redirect (
    record: RouteRecord,
    location: Location
  ): Route {
    const originalRedirect = record.redirect
    let redirect = typeof originalRedirect === 'function'
      ? originalRedirect(createRoute(record, location, null, router))
      : originalRedirect

    if (typeof redirect === 'string') {
      redirect = { path: redirect }
    }

    if (!redirect || typeof redirect !== 'object') {
      if (process.env.NODE_ENV !== 'production') {
        warn(
          false, `invalid redirect option: ${JSON.stringify(redirect)}`
        )
      }
      return _createRoute(null, location)
    }

    const re: Object = redirect
    const { name, path } = re
    let { query, hash, params } = location
    query = re.hasOwnProperty('query') ? re.query : query
    hash = re.hasOwnProperty('hash') ? re.hash : hash
    params = re.hasOwnProperty('params') ? re.params : params

    if (name) {
      // resolved named direct
      const targetRecord = nameMap[name]
      if (process.env.NODE_ENV !== 'production') {
        assert(targetRecord, `redirect failed: named route "${name}" not found.`)
      }
      return match({
        _normalized: true,
        name,
        query,
        hash,
        params
      }, undefined, location)
    } else if (path) {
      // 1. resolve relative redirect
      const rawPath = resolveRecordPath(path, record)
      // 2. resolve params
      const resolvedPath = fillParams(rawPath, params, `redirect route with path "${rawPath}"`)
      // 3. rematch with existing query and hash
      return match({
        _normalized: true,
        path: resolvedPath,
        query,
        hash
      }, undefined, location)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        warn(false, `invalid redirect option: ${JSON.stringify(redirect)}`)
      }
      return _createRoute(null, location)
    }
  }

  function alias (
    record: RouteRecord,
    location: Location,
    matchAs: string
  ): Route {
    const aliasedPath = fillParams(matchAs, location.params, `aliased route with path "${matchAs}"`)
    const aliasedMatch = match({
      _normalized: true,
      path: aliasedPath
    })
    if (aliasedMatch) {
      const matched = aliasedMatch.matched
      const aliasedRecord = matched[matched.length - 1]
      location.params = aliasedMatch.params
      return _createRoute(aliasedRecord, location)
    }
    return _createRoute(null, location)
  }

  function _createRoute (
    record: ?RouteRecord,
    location: Location,
    redirectedFrom?: Location
  ): Route {
    if (record && record.redirect) {
      return redirect(record, redirectedFrom || location)
    }
    if (record && record.matchAs) {
      return alias(record, location, record.matchAs)
    }
    return createRoute(record, location, redirectedFrom, router)
  }

  return {
    match,
    addRoutes
  }
}
```

createMatcher 首先是通过createRouteMap(routes)创建一个路由映射表。



### createRouteMap

```javascript
// 根据用户的routes配置的path、alias以及name来生成对应的路由记录。
export function createRouteMap (
  routes: Array<RouteConfig>,
  oldPathList?: Array<string>,
  oldPathMap?: Dictionary<RouteRecord>,
  oldNameMap?: Dictionary<RouteRecord>
): {
  pathList: Array<string>,
  pathMap: Dictionary<RouteRecord>,
  nameMap: Dictionary<RouteRecord>
} {
  // 初始化的三个old变量都是undefined
  // the path list is used to control path matching priority
  const pathList: Array<string> = oldPathList || []
  // $flow-disable-line
  const pathMap: Dictionary<RouteRecord> = oldPathMap || Object.create(null)
  // $flow-disable-line
  const nameMap: Dictionary<RouteRecord> = oldNameMap || Object.create(null)

  routes.forEach(route => {
    addRouteRecord(pathList, pathMap, nameMap, route)
  })

  // ensure wildcard routes are always at the end
  for (let i = 0, l = pathList.length; i < l; i++) {
    if (pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0])
      l--
      i--
    }
  }

  return {
    pathList,
    pathMap,
    nameMap
  }
}
```

pathList 保存是所有的path，pathMap是一个path的RouteRecord的映射关系。name是RouteRecord的映射关系。**RouteRecord是什么？**

```javascript
declare type RouteRecord = {
  path: string;
  regex: RouteRegExp;
  components: Dictionary<any>;
  instances: Dictionary<any>;
  name: ?string;
  parent: ?RouteRecord;
  redirect: ?RedirectOption;
  matchAs: ?string;
  beforeEnter: ?NavigationGuard;
  meta: any;
  props: boolean | Object | Function | Dictionary<boolean | Object | Function>;
}
```

他的创建时遍历routes为每一个route执行 addRouteRecord 方法生成一条记录。



### addRoutes

动态添加路由配置，有一些场景是不能提前写死路由的，所以提供了这个API 动态添加路由。再次调用addRouteMap。传入新的routes配置。因为 pathList、pathMap、nameMap都是引用类型，执行addRoutes会修改它们的值。







## 路径切换

history.transtionTo 是Vue-router中非常重要的方法。当我们切换路由线路的时候，就会执行到该方法。

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
      const vnodeData = parent.$vnode && parent.$vnode.data
      if (vnodeData) {
        if (vnodeData.routerView) {
          depth++
        }
        if (vnodeData.keepAlive && parent._inactive) {
          inactive = true
        }
      }
      parent = parent.$parent
    }
    data.routerViewDepth = depth

    // render previous view if the tree is inactive and kept-alive
    if (inactive) {
      return h(cache[name], data, children)
    }

    const matched = route.matched[depth]
    // render empty node if no matched route
    if (!matched) {
      cache[name] = null
      return h()
    }
    // 
    const component = cache[name] = matched.components[name]

    // attach instance registration hook
    // this will be called in the instance's injected lifecycle hooks
    // 添加注册钩子 钩子会被注入到组件的生命周期钩子中
    // 在install 在beforeCreate钩子中调用
    data.registerRouteInstance = (vm, val) => {
      // val could be undefined for unregistration
      const current = matched.instances[name]
      if (
        (val && current !== vm) ||
        (!val && current === vm)
      ) {
        matched.instances[name] = val
      }
    }

    // also register instance in prepatch hook
    // in case the same component instance is reused across different routes
    ;(data.hook || (data.hook = {})).prepatch = (_, vnode) => {
      matched.instances[name] = vnode.componentInstance
    }

    // register instance in init hook
    // in case kept-alive component be actived when routes changed
    data.hook.init = (vnode) => {
      if (vnode.data.keepAlive &&
        vnode.componentInstance &&
        vnode.componentInstance !== matched.instances[name]
      ) {
        matched.instances[name] = vnode.componentInstance
      }
    }

    // resolve props
    let propsToPass = data.props = resolveProps(route, matched.props && matched.props[name])
    if (propsToPass) {
      // clone to prevent mutation
      propsToPass = data.props = extend({}, propsToPass)
      // pass non-declared props as attrs
      const attrs = data.attrs = data.attrs || {}
      for (const key in propsToPass) {
        if (!component.props || !(key in component.props)) {
          attrs[key] = propsToPass[key]
          delete propsToPass[key]
        }
      }
    }

    return h(component, data, children)
  }
};
```

Router-view 是一个函数组件，他的渲染依赖render函数。它渲染什么组件？首先会获取当前路径: 

```
const route = parent.$route;

// 在init方法的时候， src/index.js 中
history.listen(route => {
  this.app.forEach((app) => {
    app._route = route;
  })
})

listen(cb: Function) {
  this.cb = cb;
}

// updateRoute 执行this.cb
updateRoute(route: Route) {
  // ...
  this.current = route;
  this.cb && this.cb(route);
  // ...
}
```









