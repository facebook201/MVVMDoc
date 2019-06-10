# 源码相关





## underscore

underscore是经常会使用到的一个工具库，里面有100多个函数，而且很小。所以学习它的源码是js进阶必备，看好的代码就像跟大师对话一般。



### 函数对象

在underscore里面，一般都是通过 _.each()的方式去调用方法，但是underscore也支持面向对象的方式调用。

```javascript
const arr = [1, 2, 3];

// 面向对象
console.log(_(arr).rest()); // [2, 3]
// 函数式
console.log(_.rest(arr)); // [2, 3]
```

那么如何实现？既然可以使用面向对象方式，那么表明 _ 不是一个对象，而是一个函数。

```javascript
var _ = function() {};
_.value = 1;
_.log = function() { return this.value + 1 };

console.log(_.value); // 1
console.log(_.log()); // 2
```

函数也是一个对象，可以自定义的函数定义在 _ 函数上。

```javascript
var __ = function(obj) {
  if (obj instanceof __) return obj;
  if (!(this instanceof __)) return new __(obj);
  this._wrapped = obj;
};

root.__ = __;
```

* this 指向window， 所以指向 new __(obj)。
* new __(obj) 中，this指向实例对象 执行 this.\_wrapped = obj, 函数执行结束
* __([1,2,3]) 返回一个对象 为 { \_wrapped: [1, 2, 3] } 该对象的原型指向 _.prototype

**但是上面是将方法挂载到函数对象上，不是函数的原型上，无法给实例使用的。所以需要一个方法来挂载到原型上，这个方法就是mixin**

### _.functions
**这个方法是用来把函数对象上的方法收集起来**
```javascript
  _.functions= function(obj) {
    var names = [];
    // 遍历函数对象
    for (var name in obj) {
      // 如果对象上的属性值是函数就加入到names
      if (_.Function(obj[name])) {
        names.push(name);
      }
    }
    return names.sort();
  };
```

### 最终的代码

```javascript
;(function() {
  var root = this;
  var perviousUnderscore = root._;

  // 缓存变量 便于压缩
  var ArrayProto = Array.prototype,
      ObjProto = Object.prototype,
      FuncProto = Function.prototype;

  // 缓存变量 减少查询次数
  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  // ES5原生方法 优先使用 如果支持
  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeBind = FuncProto.bind,
      nativeCreate = Object.create;
  
  var Ctor = function() {};

  /**
   * underscore的核心其实是一个构造函数 '_' 表示的就是这个构造函数 它
   * 支持函数调用和面向对象调用，当OOP调用 _相当于一个构造函数
   * _([1, 2, 3]).each(alert)
   */

  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._warpped = obj;
  }

  // 暴露给全局变量 
  if (typeof exports !== 'undefined') {
    // node环境
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  _.VERSION = '1.8.3';

  /**
   * 优化函数 返回一个更高级的函数 可以改变this指向 
   */
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      // The 2-argument case is omitted because we鈥檙e not using it.
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };
  
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);
    return _.property(value);
  };

  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  _.log = function() {
    console.log(1);
  };

  _.Function = function(obj) {
    return typeof obj === 'function' || false;
  };

  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

  var isArrayLike = function(collection) {
    var length = collection.length;
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  _.functions= function(obj) {
    var names = [];
    // 遍历函数对象
    for (var name in obj) {
      // 如果对象上的属性值是函数就加入到names
      if (_.Function(obj[name])) {
        names.push(name);
      }
    }
    return names.sort();
  };

  _.each = function(obj, func) {
    let i = 0;
    if (isArrayLike(obj)) {
      for (; i < obj.length; i++) {
        if (func.call(obj[i], obj[i], obj) === false) {
          break;
        }
      }
    } else {
      for (var name in obj) {
        if (func.call(obj[name], obj[name], obj) === false) {
          break;
        }
      }
    }
  }
  
  _.mixin = function(obj) {
    // 通过 _.functions 拿到 _ 上的所有方法名 返回一个数组
    var names = _.functions(obj);
    // 通过 each 把 _ 上的方法都挂到
    _.each(names, function(name) {
      var fn = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._warpped];
        push.apply(args, arguments);
        return fn.apply(_, args);
      }
    });
  };
  _.mixin(_);
}.call(this))
```



















