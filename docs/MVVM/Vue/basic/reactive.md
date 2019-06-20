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