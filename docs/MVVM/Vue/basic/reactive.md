# 响应式系统

```javascript
  // 如果有data选项 就初始化data
  if (opts.data) {
    initData(vm)
  } else {
    // observe函数是将data转换成响应式数据的核心入口
    observe(vm._data = {}, true /* asRootData */)
  }
```



## 实例对象代理访问 data

```javascript
function initData(vm) {
  let data = vm.$options.data;
  data = vm._data = typeof data === 'function'
    ? getData(data)
    : data || {};
  
  const keys = Object.keys(data);
  const props = vm.$options.props;
  const methods = vm.$options.methods;

  let i = keys.length;
  while (i--) {
    const key = keys[i];
    
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn('数据跟方法名不能重名 data优先！')
      }
    }
    if (props && hasOwn(props, key)) {
      // props跟data的key不能重复
    } else if (!isReserved(key){
      proxy(vm, `_data`, key);
    }
    // 对比下 优先级 props > dat > methods
  }
  // observe 将data数据转换成响应式的 这里就是响应式的开始
  observe(data, true);
}
```

vm.$options.data 在选项合并过程中会被处理成一个函数，且该函数的执行结果才是真正的数据。然后再看getData这个函数

```javascript
// data 是一个函数 第二个参数是Vue实例对象
export function getData (data, vm) {
  pushTarget();
  try {
    return data.call(vm, vm);
  } catch (e) {
    handleError(e, vm, 'data()');
    return {};
  } finally {
    popTarget();
  }
}
```

getData函数的作用其实就是通过调研data函数获取真正的数据对象。可以看 data.call(vm, vm); 可以看出来data是一个函数，pushTarget 和 popTarget 是防止使用props数据初始化data数据时收集冗余的依赖，这个函数主要的作用就是 **通过调用data选项获得数据对象**

```javascript
data = vm._data = getData(data, vm);
```

最终的data就会被重写，就不是一个函数了。而是一个对象。

```javascript
  // proxy data on instance
  const keys = Object.keys(data);
  const props = vm.$options.props;
  const methods = vm.$options.methods;

  let i = keys.length;
  while (i--) {
    const key = keys[i];
    
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn('数据跟方法名不能重名 methods优先！')
      }
    }
    if (props && hasOwn(props, key)) {
      // props跟data的key不能重复
    } else if (!isReserved(key)) {
      
      proxy(vm, `_data`, key);
    }
    // 对比下 优先级 props优先级 > methods优先级 > data优先级
  }
  // observe 将data数据转换成响应式的 这里就是响应式的开始
  observe(data, true);
```

!isReserved(key) 是为了避免自身的属性或方法跟用户定义的 $ _ 会冲突，所以判断一下。最关键的点在 proxy函数。core/instance/state.js

#### proxy 代理访问

```javascript
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

export function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter() {
    // 在get set方法里面 this指向某个被访问和修改属性的对象 所以这里this指向vm
    return this[sourceKey][key];
  }
  sharedPropertyDefinition.set = function proxtSetter() {
    this[sourceKey][key]
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
```

proxy函数的原理是通过Object.defineProperty在实例对象vm上定义与data数据字段同名的访问器属性，并且这些属性代理的值是 vm._data 上对应属性的值。**我们在访问ins.a 其实是访问ins.\_data.a，ins.\_data 才是真正的数据对象**

```javascript
observe(data, true);
```

调用observe函数将data数据对象转换成响应式的。综上的代码：



* 根据vm.$options.data 选项获取真正想要的数据
* 效验得到的数据是一个纯对象
* 检查数据对象data上的键是否与props、methods冲突
* 在Vue实例对象上添加代理访问数据对象的同名属性
* 最后调用observe函数开启响应式



## 数据响应式的基本思路

```javascript
const data = {
  a: 1
};

  const dep = [];

  Object.defineProperty(data, 'a', {
    set() {
      // 把数组中依赖都执行一次
      dep.forEach(fn => fn());
    },
    get() {
      // 收集依赖
      dep.push(fn);
    }
  });
```

首先从上面的data说起，我们知道Vue是通过Object.defindProperty对数据进行监听的，当获取属性a的时候，把收集的依赖放到一个数组里，当设置a的时候触发set函数，然后把数组的依赖拿出来执行。

**但是fn从哪里来呢？如何在获取属性a的时候收集依赖呢？** $watch函数接收两个参数 一个是字符串 比如数据名称'a', 第二个参数是依赖该字段的函数：

```javascript
$watch('a', () => {
  console.log('设置a');
})；
```

**所以watch知道当前正在观测那个字段，所以在$watch函数中读取该字段的值，从而触发字段的get函数 同时收集依赖**

```javascript
const data = {
    a: 1
  };
  const dep = [];

  let Target = null;

  function $watch(val, fn) {
    // 保存依赖函数
    Target = fn;
    // 读取数据字段 这样就变相的读取到get函数
    data[val];
  }

  function observe(target) {
    const keys = Object.keys(target);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(target, keys[i], target[keys[i]]);
    }
  }

  function defineReactive(obj, key, val) {
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        const value = val;
        dep.push(Target);
        return value;
      },
      set(newval) {
        dep.forEach(fn => fn());
        val = newval;
      }
    })
  }

  observe(data);

  $watch('a', () => {
    console.log('第一个依赖');
  });

  // data.a = 34;
```

使用一个全局变量来保存回调，然后在watch里面添加依赖到dep里。当如果我们尝试重新赋值就会触发依赖。

但是如果我们对象是多层的。

```javascript
const data = {
  a: {
    b: 1
  }
};

// 那么watch就有问题
function $watch(val, fn) {
  // data[val]; 这里就无法实现 data[a][b] 只能是data['a.b']
  
  Target = fn;
  let pathArr, obj = data;
 	// 如果包含.
  if (/\./.test(val)) {
    pathArr = val.split('.');
    pathArr.forEach(p => {
      // 其实通过这里来触发get函数
      obj = obj[p];
    })
    return;
  }
  data[val]
}
```

**$watch 函数其实就是想法设法的观测字段来触发get函数。来收集依赖（观察者）。现在第一个参数是符串， 那能不能是一个函数。只要这个函数执行里面有观测的字段 就会触发get函数。**

```javascript
  function $watch(val, fn) {
    Target = fn;
    let pathArr,
      obj = data;

    if (typeof val === 'function') {
      val();
      return;
    }

    if (/\./.test(val)) {
      pathArr = val.split('.');
      pathArr.forEach(p => {
        obj = obj[p];
      });
      return;
    }
    data[val];
  }
```



## observe 工厂函数

接着之前的initData的代码来看。

```javascript
// observe观测数据
observe(data, true);

export function observe(value, asRootData) {
  if (!isObject(value) || value instanceof VNode) {
    return;
  }
  
  let ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    // 如果存在 __ob__ 属性 表示已经有Observer的实例 返回这个实例就好了 避免重复观察
    ob = value.__ob__;
  } else if (
  	    /** 如果没有定义 __ob__ 属性 
     *  1 shouldObserve 判断是否应该观测 有个toggleObserving函数接收一个布尔值来切换
     *  2 不是服务端渲染
     *  3 当数据对象是数组或者纯对象才进行观测
     *  4 被观测的数据必须是可扩展的 一个普通的对象默认是可扩展的 只有 preventExtensions freeze seal 三个方法使得变为不可扩展
     *  5 isVue 避免被观测的 flag 默认是true 表示它是一个Vue的实例对象
     */
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob;
}
```



### Observer 构造函数

```javascript
  class Observer {
    constructor(value, dep, vmCount) {
      this.value = value;
      // dep 保存Dep实例对象 每个对象或数组有各自的框
      this.dep = new Dep();
      this.vmCount = 0;

      /**
       * def函数为数据对象定义一个 __ob__ 属性，这个属性的值就是当前Observer实例对象。
       * def本质上是 Object.defineProperty 函数的简单封装 这样定义__ob__ 属性可以定义不可枚举的熟悉
       * 这样后面遍历数据对象的时候能够防止遍历到__ob__属性
       */
      def(value, '__ob__', this);

      if (Array.isArray(value)) {
        const argument = hasProto
          ? protoAugment
          : copyAugment;

        augment(value, arrayMethods, arrayKeys);

        this.observeArray(value);
      } else {
        this.walk(value);
      }
    }

    walk(obj) {
    }
    observeArray(items) {
    }
```

经过def处理的数据对象

```javascript
const data = {a: 1};
// 处理之后
data = {
  a: 1,
  // __ob__ 是不可枚举的
  __ob__: {
    value: data,
    dep: dep实例对象, // new Dep
    vmCount: 0
  }
};
```



## 响应式数据之纯对象处理

```javascript
if (Array.isArray(value)) {
        const argument = hasProto
          ? protoAugment
          : copyAugment;

        augment(value, arrayMethods, arrayKeys);

        this.observeArray(value);
      } else {
        this.walk(value);
      }
```

根据观测的对象类型来做不同的处理，纯对象会走 walk函数。循环遍历观测每一个对象，

```javascript
    walk(obj) {
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        defineReactive(obj, keys[i]);
      }
    }

  /**
   * 将数据设置一堆getter setter 
   * obj 观测的数据 key是对象的属性 val是属性值
   */
    
  function defineReactive(obj, key, val, customSetter, shallow) {
    // dep 常量是一个Dep实例对象
    const dep = new Dep();
	
    // getOwnPropertyDescriptor 取得可能已经有的属性描述符对象，将该镀锌保存在property常量中，
    const property = Object.getOwnPropertyDescriptor(obj, key);
    
    if (property && property.configurable === false) {
      return;
    }

    const getter = property && property.get;
    const setter = property && property.set;
		
    // 
    if ((!getter || setter) && arguments.length == 2) {
      val = obj[key];
    }
		
    // 上面得到val之后 如果val也是一个对象，就应该继续调用observe(val)函数观测对象从而深度观测数据对象
    // shallow默认是undefined 所以默认是深度观测的， 但是注意的是深度观测时 val不一定有值，因为必须满足 (!getter || setter) arguments.length == 2才触发取值动作。
    let childOb = !shallow && observe(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter() {
        const value = getter ? getter.call(obj) : val;
        // 收集依赖 Dep.target 保存的是要收集的依赖 如果存在就表示有依赖要收集
        if (Dep.target) {
          dep.depend();
          if (childOb) {
            // 子对象进行依赖收集 
            childOb.dep.depend();
            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }
        return value;
      },
      set: function reactiveSetter(newval) {
        const value = getter ? getter.call(obj) : val;
        // 如果值不变就返回 还有要去掉 NaN
        if (newval === value || (newval !== newval && value !== value)) {
          return;
        }
        if (process.env.NODE_ENV !== 'production' && customSetter) {
          customSetter();
        }

        if (setter) {
            setter.call(obj, neval);
        } else {
          val = newval;
        }
        
        childOb = !shallow && observe(newval);
        dep.notify();
      }
    })
  }
```

在defineReactive里面都有一个dep常量，**每个数据字段都通过闭包引用着属于自己的dep常量。因为walk函数中循环遍历所有数据对象的属性，并调用defineReactive函数定义访问器属性时，getter/setter 都闭包引用了一个属于自己的筐**

```javascript
const data = {
  a: 'a',
  b: 'b'
};
```

这里的data.a 和 data.b 都有自己的Dep实例对象，都是用来收集哪些属于对应字段的依赖。



## get 中收集依赖

```javascript
// get主要做两件事 
// 第一件 正确的返回属性值
// 第二件 收集依赖
get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        // depend就是收集依赖
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
          // Vue处理对象和函数的方式是不同的 所以数组每个元素的依赖搜集要逐个处理
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    }
```

首先保存getter，getter是常量保存的属性原有的get函数，如果存在就直接调用该函数，否则就是要val作为属性值。Dep.target 中保存的值就是要被收集的依赖( 观察者 )。所以如果Dep.target 存在的话 说明有依赖需要被收集，这个时候才需要执行 if 语句块内的代码。



然后判断childOb是否存在，如果存在就执行childOb.dep.depend()。先来看看childOb是什么？

```javascript
// 在observe里
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    // 如果存在 __ob__ 属性 表示Observer 已经有实例了 返回这个实例就好了 避免重复观察
    ob = value.__ob__
  }
```

let childOb = !shallow && observe(val)。在观测对象的函数里，childOb是observe的返回值。从上面的函数可以看到ob就是函数的返回值，所以 **childOb === data.a.\__ob__** 所以 childOb.dep.depend 意思是将相同的依赖收集到 data.a.\__obj__.dep 里，**收集两个依赖的意义是两个依赖的触发时机不同，作用不同**

* 第一个 dep (a)
* 第二个 childOb.dep (data.a.\__ob__)

第一个的触发时机是a被修改的时候触发，在set里面触发 dep.notify()。第二个是给 Vue.set给对象添加新属性时触发。

```javascript
    Vue.set = function (obj, key, val) {
      defineReactive(obj, key, val);
      // 相当于data.a.__ob__.dep.notify()
      obj.__obj__.dep.notify();
    };

    Vue.set(data.a, 'value', 1);
```

所以 `__ob__` 属性以及 `__ob__.dep` 的主要作用是为了添加、删除属性时有能力触发依赖，而这就是 `Vue.set` 或 `Vue.delete` 的原理。



## set 函数中如何触发依赖

get函数用于收集依赖，set函数用于触发依赖。

```javascript
set: function reactiveSetter (newVal) {
  const value = getter ? getter.call(obj) : val
  /* eslint-disable no-self-compare */
  if (newVal === value || (newVal !== newVal && value !== value)) {
    return
  }
  /* eslint-enable no-self-compare */
  if (process.env.NODE_ENV !== 'production' && customSetter) {
    customSetter()
  }
  if (setter) {
    setter.call(obj, newVal)
  } else {
    val = newVal
  }
  // shallow 
  childOb = !shallow && observe(newVal)
  dep.notify()
}
```

由于属性被设置了新的值，那么假如我们为属性设置的新值是一个数组或者纯对象，那么该数组或纯对象是未被观测的，所以需要对新值进行观测，这就是第一句代码的作用，同时使用新的观测对象重写 `childOb` 的值。当然了，这些操作都是在 `!shallow` 为真的情况下，即需要深度观测的时候才会执行。最后是时候触发依赖了，我们知道 `dep` 是属性用来收集依赖的”筐“，现在我们需要把”筐“里的依赖都执行一下，而这就是 `dep.notify()` 的作用。



### 数组变异方法的思路

数组里面有很多方法是会改变原来自身的值，`push`、`pop`、`shift`、`unshift`、`splice`、`sort` 以及 `reverse` 等。当用户调用这些变异方法改变数组时需要触发依赖。换句话说我们需要知道开发者何时调用了这些变异方法，只有这样我们才有可能在这些方法被调用时做出反应。

![border](https://raw.githubusercontent.com/facebook201/MVVMDoc/master/img/arrayMethod.png)

```javascript
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

const arrayMethods = Object.create(Array.prototype);
const arrayProto = Array.prototype;

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

methodsToPatch.forEach(function(method) {
  // 缓存原数组的方法
  const original = arrayProto[method];
	
  def(arrayMethods, method, function mutator (...args) {
    // 把变异方法的返回值赋值给result。 最后返回result，这样保证了拦截函数与数组原本变异方法的功能是一致的
    const result = original.apply(this, args);
    
    // 这里的this就是实例本身。 __ob__.dep 中收集了所有该对象的依赖(观察者)。
    // 所以修改数组之后 会改变数组 所以需要把所有依赖拿出来执行 更新一遍
    const ob = this.__ob__;
    let inserted;

    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }

    if (inserted) ob.observeArray(inserted);

    ob.dep.notify();
    return result;
  });
});
```

arrayMethods 对象的原型是真正的数组构造函数的原型，methodsToPatch常量是一个数组，包含了所有需要拦截的数组变异方法名字，通过def函数给arrayMethods对象上定义与数组相同的方法，从而做到拦截的目的。

def的函数在arrayMethods上定义与数组变异方法同名的函数。

```javascript
  Object.defineProperty(obj, key, {
    value: arrayMethod[method], // value相当于是个函数
    enumerable: false,
    writable: true,
    configurable: true
  })
// augment(value, arrayMethods, arrayKeys)
// IE11下 target 是内部的数组实例，key是方法名 src[key]就是 代理的对象 继承真正的数组
def(target, key, src[key]);
```

**这里的代码就是说，如果我们访问a.push(1) 首先回去找到arrayMethods.push(1),然后再去找到def里面缓存的真正的方法，执行相应的代码，同时把增加的动作的依赖更新一下。**



这里的obj相当于是 arrayMethods。当去调用变异方法的时候就通过原本的方法来返回，然后去更新依赖。

**所有新增的元素都不是响应式的，需要把新增的元素拿出来调用observeArray对其进行观测。**

```javascript
if (inserted) ob.observeArray(inserted);
```



### copyAugment不支持\__proto__

```javascript
function copyAugment(target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    def(target, key, src[key]);
  }
```

copyAugment 函数的第三个参数keys就是定义在 arrayMethods对象上的所有函数的键，通过for循环使用def函数在数组上定义与数组变异方法相同的不可枚举的函数。**上面两个方法都是把数组实例与代理原型或与代理原型中的函数联系起来 来达到拦截数组变异方法。**

```javascript
    if (Array.isArray(value)) {
      const augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value)
    } else {
      this.walk(value)
    }
```

然后开始看 observeArray方法的作用，如果数据数组里面嵌套里数组，那么他们却不是响应式的，所以需要递归观测那些类型。通过循环每个数组元素，然后observe(items[i]);



## 数组的特殊性

在get函数里面，收集依赖的时候，数组会单独处理

```javascript
if (Array.isArray(value)) {
  dependArray(value);
}
//
arr: [
  { a: 1}
]
```

**简单来说这里是为了给数组里面更加复杂的对象收集依赖的**

```javascript
function dependArray(value) {
  for (let i = 0, l = value.length; i < l; i++) {
    // 循环遍历 获得每一个元素，如果该元素拥有 __ob__ 和 __ob__.dep 对象 那么说明这个元素也是一个对象或数组 然后手动执行 __ob__.dep.depend() 收集依赖。
    e = value[i];
    e && e.__ob__ && e.__ob.__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}
```

**数组的索引是非响应式的，跟对象不同。对象只要逐个将对象的属性重新定义为访问器属性，并且当属性的值同样为纯对象时进行递归定义 但是数组对处理就是通过拦截数组变异方法的方式。** 下面的方法触发不了响应式

```javascript
const vm = new Vue({
  data: {
    arr: [1, 2]
  }
})

vm.arr[0] = 3; // 这样操作是无效的 索引是非响应式的
```

对于数组来说，索引不是访问器属性，所以当有观察者依赖数组的某一个元素是触发不了这个元素的get函数的，所以就收集不到依赖。



## Vue.set 和 Vue.delete

Vue是无法拦截到一个对象或数组添加元素的能力，所以增加了 set 和 delete，同时也在实例上实现这两个方法。在源码 ' src/core/instance/state.js ' 的 stateMixin 函数中。

```javascript
function stateMixin(Vue) {
  const dataDef = {};
  dataDef.get = function () { return this._data };
  const propsDef = {};
  propsDef.get = function () { return this._props };

  Object.defineProperty(Vue.prototype, '$data', dataDef);
  Object.defineProperty(Vue.prototype, '$props', propsDef);

  Vue.prototype.$set = set;
  Vue.prototype.$delete = del;

  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    // 一般第二个参数传一个函数 例如 function(newVal, val){  }
    // 也可以穿一个对象 里面包含handler属性 属性值作为回调
    const vm: Component = this
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    // 如果是回调函数
    options = options || {}
    options.user = true
    // 创建一个Watcher实例对象
    const watcher = new Watcher(vm, expOrFn, cb, options)
    // immediate选项用来在属性或函数被侦听后立即执行回调 
    // 如果 immediate 为真
    if (options.immediate) {
      // watcher.value 是 watch处理之后 this.getter() 返回的值 也就是被观察属性的值
      cb.call(vm, watcher.value)
    }
    // 返回一个函数 这个函数如果执行就解除当前观察者对属性的观察 它的原理是通过调用观察者实例对象
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}
```

set 和 del 的定义在initGlobalAPI里面，

```javascript
function initGlobalAPI(Vue) {
  Vue.set = set;
  Vue.delete = del;
}
```



### \$set 和 $delete

```javascript
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val;
  }
```

上面的代码是通过splice利用了替换元素的能力，将指定位置元素的值替换为新值。同时由于splice方法本身是能够触发响应的。而且处理了数组索引的值，防止设置的元素的索引大于数组的长度。



```javascript
  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val;
  }
```

如果不是数组，就走对象的判断。但是看到有两个条件要满足

* key要在target的原型链上
* 但是不能再object.prototype 上

[这个issue](https://github.com/vuejs/vue/issues/6845)



```javascript
  const ob = target.__ob__;
	// 如果不存在
	
	// 不能在根数据添加属性
  if (target._isVue || (ob && ob.vmCount)) {
    // process.env.NODE_ENV !== 'production' && warn(
      // 'Avoid adding reactive properties to a Vue instance or its root $data ' +
      // 'at runtime - declare it upfront in the data option.'
    return val
  }

  if (!ob) {
    target[key] = val;
    return val;
  }
  defineReact(ob.value, key, val);
  ob.dep.notify();
```

ob它是数据对象 `__ob__` 属性的引用。第二句高亮的代码使用 `defineReactive` 函数设置属性值，这是为了保证新添加的属性是响应式的。第三句高亮的代码调用了 `__ob__.dep.notify()` 从而触发响应。这就是添加全新属性触发响应的原理。

**对于根数据的Observer实例对象，想要在根数据上使用set是不想的，因为data根数据自己本身就不是响应式的。**

