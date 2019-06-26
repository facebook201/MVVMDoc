
# 渲染函数的观察者



## $mount 挂载函数

```javascript
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
  // ...
      
    // 如果存在 el参数 则 $mount 挂载到el元素上
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }    
  }
}
```

在所有选项初始化好之后，最后一句代码就是把组件挂载到给定元素上的？先来看看$mount函数的实现

```javascript
Vue.prototype.$mount = function(el, hydrating) {
	el = el && inBrowser ? query(el) : undefined;
    return mountComponent(this, el, hydrating);
}
```

第一句代码是检测el选项，然后判断是否在浏览器，最后通过query函数查找对应的元素并返回

第二句代码 mountComponent 函数完成真正的挂载



```javascript
export function mountComponet (vm, el, hydrating) {
    // 组件实例添加$el属性
    vm.$el = el;
    if (!vm.$options.render) {
        vm.$options.render = createEmptyVNode;
    }
    // ...
    callHook(vm, 'beforeMount');
}
```

**vm.$el 始终是组件模板的根元素。如果我们在new Vue的参数里面传了template选项指定模板，那么vm.\$el 自然就是id为bar的div引用。** 这里虽然传的是外层的el，但是在虚拟DOM的 patch算法上 会被patch算法重写。

```javascript
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
  // ...

  if (!prevVnode) {
    // initial render
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
  } else {
    // updates
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
}
```

后面如果不存在渲染函数 那么就临时设置一个createEmptyVNode函数，这时候就渲染一个空的vnode对象。然后开始 调用 beforeMount生命周期钩子函数。开始挂载工作。

```javascript
let updateComponent
/* istanbul ignore if */
// 进行一些性能统计 
if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
  updateComponent = () => {
    const name = vm._name
    const id = vm._uid
    const startTag = `vue-perf-start:${id}`
    const endTag = `vue-perf-end:${id}`
	// 统计运行render 和 update函数的运行性能
    mark(startTag)
    const vnode = vm._render()
    mark(endTag)
    measure(`vue ${name} render`, startTag, endTag)

    mark(startTag)
    vm._update(vnode, hydrating)
    mark(endTag)
    measure(`vue ${name} patch`, startTag, endTag)
  }
} else {

  updateComponent = () => {
    // 这里可以先理解 _render函数是调用 vm.$options.render函数返回生成虚拟节点Vnode
    // _update 函数的作用是把 vm._render函数 生成的虚拟节点渲染成真正的DOM
    vm._update(vm._render(), hydrating)
  }
}
```

这里的代码 定义并初始化 updateComponent函数，这个函数将用作创建 Watcher实例时传递给Watcher 构造函数的第二个参数。if else 语句块的功能不必，只是进行性能统计。

**updateComponent函数的作用就是：把渲染函数生成的虚拟DOM渲染成真正的DOM**



## Watcher 观察者构造函数

```javascript
// 渲染函数的观察者
new Watcher(vm, updateComponent, noop, {
  before () {
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate')
    }
  }
}, true /* isRenderWatcher */);
```

正是因为watcher 对表达式的求值，触发了数据属性的get拦截器函数，从而收集到了依赖，数据变化触发响应。Watcher观察者实例将对 updateComponent 函数求值。updateCompinent 函数的执行会触发渲染函数（vm.$options.render）的执行，而渲染函数的执行则会触发数据属性的get 拦截器操作。从而收集依赖，数据变化重新执行updateComponent。这就完成了重新渲染。



### watcher

