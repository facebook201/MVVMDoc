# new Vue

首先进入到core目录里面查看index.js文件，发现Vue从 'instance/index' 下来的。打开这个文件发现如下代码

#### core/global-api/index.js

```javascript
// 再core/index里面有一行代码 
initGlobalAPI(Vue); // 这里面是给Vue对象本身扩展全局静态方法

// 
export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // 在Vue构造函数上添加config对象 
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 暴露Vue的util方法 最好不要依赖他们 因为他们有可能会经常变
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  // 添加四个属性 在响应式对象中添加一个属性 确保新属性也是响应式的 且触发视图更新
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  extend(Vue.options.components, builtInComponents)

  initUse(Vue)
  initMixin(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
}
```

上面是给Vue添加一个静态方法，比如Vue.config 是一个对象，包含Vue的全局配置。可以启动应用之前修改一些属性。比如有一个 Vue.config.devtools = true ; 可以在开发环境使用，生产环境默认实false。里面还有一些类似 Vue.use, Vue.mixin的静态方法。

#### instance/index.js

```javascript
// 从五个文件导入五个方法 初始化
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 定义 Vue构造函数
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 执行初始化函数
  this._init(options)
}

// 把Vue作为参数传递给这五个方法

// 在Vue原型上面添加了 _init 方法 内部初始化
initMixin(Vue)
// 处理 $data 和 $props 这两个属性 如果不是生成环境这两个属性无法修改 redad-only
// 这两个属性是只读属性 看里面的实现就知道怎么实现只读属性
stateMixin(Vue)
// 初始化事件 这里添加了 $on $once $off $emit 四个事件方法 
eventsMixin(Vue)
// 添加了 _update $forceUpdate $destory 三个方法
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
```

在这里我们可以看到Vue其实是一个构造函数，然后里面有一个 this._init(options)，初始化方法 里面会有很多初始化的代码。



#### initMixin

```javascript
export function initMixin (Vue) {
  Vue.prototype._init = function(options) {
    const vm = this;
    vm._uid = uid++;
    // 标识这个对象 vm 是一个Vue实例，告诉响应式系统不要被观测。
    vm._isVue = true;

    if (options && options._isComponent) {
      initInternalComponent(vm, options);
    } else {
      // 给vm 添加一个$options 属性，这个属性在后面会被大量的用到
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm);
    } else {
      vm._renderProxy = vm;
    }

    vm._self = vm;
    initLifeCycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, 'beforeCreate');
    initInjections(vm);

    initState(vm);
    initProvide(vm);
    callHook(vm, 'created');

    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  }
}
```



##### vm.$options = mergeOptions

初始化函数里有一行这个代码，用来合并选项的代码。那么来看看这个代码的实现，最后**返回的也是一个对象，赋值给$options**

```javascript
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  if (process.env.NODE_ENV !== 'production') {
    checkComponents(child)
  }

  if (typeof child === 'function') {
    child = child.options
  } 
  // 规范选项的代码
  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)
  const extendsFrom = child.extends
  if (extendsFrom) {
    parent = mergeOptions(parent, extendsFrom, vm)
  }
  if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }
  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}



// 这个函数的作用永远都是用来获取当前实例构造者的 options 属性的，
// 即使 if 判断分支内也不例外，因为 if 分支只不过是处理了 options，
// 最终返回的永远都是 options 内部的实现 跟 Vue.extend 有关
export function resolveConstructorOptions (Ctor: Class<Component>) {}
```



