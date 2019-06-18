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

```











































