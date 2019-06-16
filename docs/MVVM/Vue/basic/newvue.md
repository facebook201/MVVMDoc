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



## 规范化props

```javascript
  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)
```

上面代码是规范选项的，比如在vue里面props我们可以按照文档说法，可以传数组的字符串，也可以传对象；

```javascript
{
    props: ['data', 'title']
}
// 或者
{
    props: {
        data: {
            type: Number,
            default: 0 
        }
    }
}
```

虽然说开发者提供了很灵活的传参，但是对vue内部来说不是好事，所以他要处理。将传进来的参数规范化。

##### normalizeProps 

```javascript
function normalizeProps(options, vm) {
  const props = options.props;
  if (!props) return
  const res = {};
  let i, val, name;

  if (Array.isArray(props)) {
    i = props.length;
    while(i--) {
      val = props[i];
      if (typeof val === 'string') {
        // camelize 是将字符转成形如 myData 驼峰式的
        name = camelize(val);
        res[name] = { type: null };
      } else if (process.env.NODE_ENV !== 'production') {
        // 报警一个 告诉其当为数组形式的时候必须使用字符串
      }
    }
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key];
      name = camelize(val);
      res[name] = isPlainObject(val)
        ? val
        : { type: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    // 报警只能是对象或者数组 
  }
  options.props = res;
}
```

最后就通过这个函数得到

```javascript
// props: ['data']
{
    props: {
        data: {
            type: null
        }
    }
}
// 
{
    props: {
        data: Number,
        data1: {
            type: string,
            default: ''
        }
    }
}
// 就会变成下面这样的
{
    props: {
        data: {
          type: Number  
        },
        data1: {
            type: string,
            default: ''
        }
    }
}
```



## 规范化inject

**子组件可以使用父组件通过provide提供给子组件的数据，在子组件里面使用inject选项注入数据**，

可以写成两种形式 一种是数组 一种是对象

```duijavascript
// 数组
['data', 'data1']
// 规范成
{
  'data': { from: 'data' },
  'data1': { from: 'data1' }  
}

// 对象
inject: {
  foo: {
    default: '1'
  }
}
```

内部实现 规范化inject

```javascript
function normalizeInject (options: Object, vm: ?Component) {
  const inject = options.inject
  if (!inject) return
  const normalized = options.inject = {}
  if (Array.isArray(inject)) {
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] }
    }
  } else if (isPlainObject(inject)) {
    for (const key in inject) {
      const val = inject[key]
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "inject": expected an Array or an Object, ` +
      `but got ${toRawType(inject)}.`,
      vm
    )
  }
}
```



## 规范化directives

针对指令里面的函数写法和对象写法规范成对象写法

```javascript
function normalizeDirectives (options: Object) {
  const dirs = options.directives
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key]
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def }
      }
    }
  }
}
//
directives: {
    test1: {
        bind: function() {
            
        },
        update: () {
            
        }  
    }
}
```

## 选项的合并

上面的代码都是init里规范某些选项参数。下面的就是合并阶段，还是mergeOptions函数的代码

```javascript
const options = {}
  let key
  // parent 是一系列操作时候返回的对象 options
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
```

这里会通过吧options遍历然后把key值都传给一个mergeField函数。key就是 `components`、`directives`、`filters` 以及 `_base`    mergeField函数只有两句代码，第一句定义了一个常量strat，它是通过制定的key访问 strats 对象得到。**strats是一个全局配置里面的optionMergeStrategies**

***选项覆盖策略是处理如何将父选项值和子选项值合并到最终值的函数*。也就是说 `config.optionMergeStrategies` 是一个合并选项的策略对象，这个对象下包含很多函数，这些函数就可以认为是合并特定选项的策略。这样不同的选项使用不同的合并策略，如果你使用自定义选项，那么你也可以自定义该选项的合并策略，只需要在 `Vue.config.optionMergeStrategies` 对象上添加与自定义选项同名的函数就行。**



## el、propsData的合并策略















