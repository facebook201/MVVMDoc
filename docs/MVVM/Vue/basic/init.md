# Vue的初始化

 选项的合并是通过mergeOptions函数合并处理返回的，然后返回值作为vm.$options的值。在mergeOptions之后，有一个_renderProxy属性，接着来看看这个代码。

```javascript
if (process.env.NODE_ENV !== 'production') {
  initProxy(vm);
} else {
  vm._renderProxy = vm;
}
```

这里会在vm下添加一个_renderProxy属性，来看一下initProxy。

```javascript
// 声明 initProxy 变量
let initProxy

if (process.env.NODE_ENV !== 'production') {
  // ... 其他代码
  
  // 在这里初始化 initProxy
  initProxy = function initProxy (vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      const options = vm.$options
      const handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler
      vm._renderProxy = new Proxy(vm, handlers)
    } else {
      vm._renderProxy = vm
    }
  }
}

// 导出
export { initProxy }
```

**上面的代码在开头声明了initProxy变量但是没有初始化，所以在生产环境下 initProxy就是undefined，**

### 暂时空着 proxy 等到 深入学习proxy 和 反射之后



## 初始化 initLifeCycle

```javascript
vm._self = vm;
initLifecycle(vm);
```

首先在Vue实例对象上面添加了 _self属性，指向真实的实例本身。注意 vm.\_self 和 vm.\_renderProxy 不同，\_renderProxy可能是一个代理对象，proxy的实例。

```javascript
function initLifecycle(vm) {
  const options = vm.$options;
  // 定义parent 引用当前实例的父实例
  let parent = options.parent;
  // 如果当前实例有父组件，且当前实例不是抽象的
  if (parent && !options.abstract) {
    // 使用 while 循环查找第一个非抽象的父组件
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    // 经过上面的while循环后 parent应该是一个非抽象的组件 将它作为当前实例的父级
    // 所以当前实例 vm 添加到父级的 $children 属性里
    parent.$children.push(vm);
  }
  vm.$parent = parent;
  // 设置 $root 属性， 有父级就是父级的$root 否则就是自己
  vm.$root = parent ? parent.$root : vm;
}
```

上面的代码就是 将当前实例添加到父实例的 $children 属性里，并设置当前实例的 \$parent指向父实例。那么

options是来自 vm.$options的引用，所以options.parent 是 vm.\$options.parent, 那么vm.\$options.parent 从哪里来。 **在Vue里面有一些内部选项没有暴露给我们，比如abstract，指定组件是抽象的。** 他们不渲染真实dom,  比如 keep-alive, transition 这两个组件是不会渲染DOM至页面，但是依然给我们提供很有用的功能，

```javascript
// core/components/keep-alive

export default {
  name: 'keep-alive',
  abstract: true, // 这是内部keep-alive 组件

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },
}
```

除此之外还有一个特点，他们不会出现在父子关系的路径上。所以options.abstract 是抽象的，如果 **是真的，那么while循环的代码就会沿着父实例链逐层向上寻找到第一个不抽象的实例作为 parent，然后找到之后将当前实例添加到父实例的$children属性中**

```javascript
vm.$children = []
vm.$refs = {}

vm._watcher = null
vm._inactive = null
vm._directInactive = false
vm._isMounted = false
vm._isDestroyed = false
vm._isBeingDestroyed = false
```



## 初始化 initEvents

初始化事件代码

```javascript
function initEvents (vm) {
  // 添加两个属性 _events 和 _hasHookEvent
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  
  // _parentListeners 是来自 createComponentInstanceForVNode
  const listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}


//  createComponentInstanceForVnode 创建子组件实例的时候添加的参数选项
export function createComponentInstanceForVnode (
  vnode: any, // we know it's MountedComponentVNode but flow doesn't
  parent: any, // activeInstance in lifecycle state
  parentElm?: ?Node,
  refElm?: ?Node
): Component {
  const vnodeComponentOptions = vnode.componentOptions
  const options: InternalComponentOptions = {
    _isComponent: true,
    parent,
    propsData: vnodeComponentOptions.propsData,
    _componentTag: vnodeComponentOptions.tag,
    _parentVnode: vnode,
    _parentListeners: vnodeComponentOptions.listeners,
    _renderChildren: vnodeComponentOptions.children,
    _parentElm: parentElm || null,
    _refElm: refElm || null
  }
  // check inline-template render functions
  const inlineTemplate = vnode.data.inlineTemplate
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render
    options.staticRenderFns = inlineTemplate.staticRenderFns
  }
  return new vnodeComponentOptions.Ctor(options)
}
```



## initRender 

```java
  // 添加两个属性 子树的根 和 缓存树
  vm._vnode = null;
  vm._staticTrees = null;
  const options = vm.$options;
  const parentVnode = vm.$vnode = options._parentVnode;
  const renderContext = parentVnode && parentVnode.context;
  vm.$slot = resolveSlots(options._renderChildren, renderContext);
  vm.$scopedSlots = emptyObject;
```

上面的代码都是添加一些属性到vm实例上， 以及如何解析 slot的。( 后面会说到 )

```javascript
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
```

这里添加了两个方法 _c 和$createElement,这两个函数都是对内部的createElement包装，写过render函数的都知道

```javascript
render(createElement) {
  return createElement('h1', 'title');
}
// 或者
render() {
  return this.$createElement('h1', 'title');
}
```

其中 _ c 和 createElement 函数时传递的第六个参数不同。

```javascript
  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  // 为了更好的使用高阶组件 暴露$attrs 和 $listeners
  // 他们需要被动响应 以便使用高阶组件能实时更新
  const parentData = parentVnode && parentVnode.data

  /* istanbul ignore else */
  if (process.env.NODE_ENV !== 'production') {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm)
    }, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm)
    }, true)
  } else {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
  }
```

关于 isUpdatingChildComponent 变量，根据引用的关系 从lifeCycle 文件里面发现这个变量

```javascript
// 定义 isUpdatingChildComponent，并初始化为 false
export let isUpdatingChildComponent: boolean = false

// 省略中间代码 ...

export function updateChildComponent (
  vm: Component,
  propsData: ?Object,
  listeners: ?Object,
  parentVnode: MountedComponentVNode,
  renderChildren: ?Array<VNode>
) {
  if (process.env.NODE_ENV !== 'production') {
    isUpdatingChildComponent = true
  }

  // 省略中间代码 ...

  // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  vm.$attrs = parentVnode.data.attrs || emptyObject
  vm.$listeners = listeners || emptyObject

  // 省略中间代码 ...

  if (process.env.NODE_ENV !== 'production') {
    isUpdatingChildComponent = false
  }
}
```

开始是默认false，只有执行 updateChildComponent函数之后才被更新为true，执行完之后又变成false，这是因为 updateChildComponent 需要更新实例对象 的 attrs 和 listeners属性，所以不需要提示 他们两个是只读属性。



## 生命周期钩子的实现

```javascript
callHook(vm, 'beforeCreate')
initInjections(vm) // resolve injections before data/props
initState(vm)
initProvide(vm) // resolve provide after data/props
callHook(vm, 'created')
```

从lifeycle文件里面找到 callHook函数。

```javascript
export function callHook (vm: Component, hook: string) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget()
  // 这里的代码相当于 
  // const handlers = vm.$options.created handlers会被合并成一个数组
  const handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      try {
        handlers[i].call(vm)
      } catch (e) {
        handleError(e, vm, `${hook} hook`)
      }
    }
  }
  // _hasHookEvent是在initEvent函数中定义的，它是判断是否存在生命周期钩子的事件侦听器，
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
  popTarget()
}
```

initState包括了: initProps、initMethods、initData、initComputed、以及initWatch。所以在beforeCreate钩子中是无法使用的，只能在created里面使用，但是此时还没有任何的挂载操作，所以不能访问DOM，$el。

**生命周期钩子的事件侦听器是监听组件相应生命周期事件** 其实Vue可以这样写

```javascript
<child
	@hook:beforeCreate="handleChildBeforeCreate"
	@hook:created="handleChildCreated">
</child>
```

那么Vue是如何检测是否存在生命周期事件侦听器的？在Vue事件系统会有解释。



## Vue的初始化之initState

```javascript
callHook(vm, 'beforeCreate')
initInjections(vm) // resolve injections before data/props
initState(vm)
initProvide(vm) // resolve provide after data/props
callHook(vm, 'created')
```

在initState函数执行之前，先执行initInjections 函数，也就是inject选项要更早被初始化。





























