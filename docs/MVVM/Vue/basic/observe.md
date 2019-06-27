
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

**观察者模式是非常常用的设计模式** 举个简单的例子。
如果你要去买房，你朋友张三也要去买房，还有隔壁王二麻子也要买房。你们几个都是观察者，而卖房子的就是被观察者。你们订阅了一些信息之后，就不要管任何事情了，有消息被观察者买房子的就会通知你。这样就完成了解耦，因为你不需要一致去看，有消息被观察者就通知你。这个模式又叫发布订阅模式，你是订阅者，他是发布者。只不过发布订阅存在一个中间调度，你们两个不直接沟通而已。

 
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

```javascript
class Watcher {

  /**
   * @param vm 组件实例对象，
   * @param expOrFn 观察的表达式
   * @param cb 被观察的表达式的值变化时的回掉函数
   * @param options 传递给当前观察者对象的选项 
   * @param isRenderWatcher 改观察者实例是否是渲染函数的观察者
   */
  constructor (
    vm,
    expOrFn,
    cb,
    options,
    isRenderWatcher
  ) {
    // ....
  }
}
```

watcher构造函数的五个参数如上，下面是 mountComponent函数中创建渲染函数观察者实例的代码。

```javascript
new Watcher (vm, updateComponent, noop, {
  before () {
    //  看到当数据变化之后，触发更新之前，如果 vm._isMounted 属性的值为真，则会调用 beforeUpdate 生命周期钩子
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate');
    }
  }
}, true);
```

* 第二个参数被观察的表达式是一个函数，Watcher的原理就是通过对 “被观测目标” 的求值，触发数据属性的get 拦截器函数从而收集依赖，至于被观测的目标是不是表达式 还是函数都不重要，重要的是能否触发数据属性的get函数。 
* 第三个参数 noop是一个空函数，实际上数据的变化不仅仅会执行回调，还会重新对“被观察目标”求值，也就是说 `updateComponent` 也会被调用，所以不需要通过执行回调去重新渲染。

```javascript
  constructor (
    vm,
    expOrFn,
    cb,
    options,
    isRenderWatcher
  ) {
    this.vm = vm;
    // 如果是渲染函数的观察者就把观察者实例赋值给 vue实例的_watcher 属性
    if (isRenderWatcher) {
      vm._watcher = this;
    }
    // 把观察者实例推到 watchers 中，也就是说属于该组件的观察者都会被添加到该组件的实例对象的 vm._watchers 数组中。
    vm._watchers.push(this);
  }
```
首先将当前组件实例对象vm赋值给该观察者实例的 this.vm 属性，也就是说每一个观察者实例对象都有一个vm实例属性，**指明了这个观察者是属于哪一个组件。**，isRenderWatcher 是否是渲染函数的
观察者，只有在updateComponent函数中创建渲染函数观察者才为真，如果是渲染函数的观察者就将实例赋值给_watcher。


```javascript
  this.cb = cb;
  this.id = uid++;
  // active标识该观察者实例对象是否是激活状态，默认值true 表示激活
  this.active = true;
  // dirty跟计算属性值一样 只有计算属性的观察者实例才是真，因为 computed 是惰性求值
  this.dirty = this.computed;

  // 依赖收集 避免重复收集依赖 去除没有用的依赖
  this.deps = [];
  this.newDeps = [];

  this.depIds = new Set();
  this.newIds = new Set();

  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = function () {};
    }
  }
```
如果 expOrFn是函数，直接用 expOrFn作为this.getter属性的值，如果不是函数 就给 parsePAth函数解析。this.getter 最后始终是一个函数
```javascript
// 匹配不是 英文字母 数字 下划线 . 和 $的任意字符
const bailRE = /[^\w.$]/;

function parsePath (path) {
  if (bailRE.test(path)) {
    return;
  }
  // 如果是 a.b 形式的就深度监听
  const segments = path.split('.');
  // [a, b];
  // obj 就是监听的对象
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]];
    }
    return obj;
  }
}
```
parsePath 函数接受的参数是什么？函数或者字符串。
```javascript
const expOrFn = function () {
  return this.obj.a;
}

this.$watch(exOrFn, function() { /* 回调 */ })

this.$watch('a.b.c', function() { /* 回调 */})
```
可以看到parsePath函数返回的是另一个函数，
```javascript
// 计算属性的观察者和其他观察者实例对象的处理方式不同
if (this.computed) {
  this.value = undefined;
  this.dep = new Dep();
} else {
  // 计算属性的观察者之外的实例对象
  this.value = this.get();
}
```

## 依赖收集的过程


















