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
  if (!(this instanceof __)) return new __(obj);
  this._wrapped = obj;
};

root.__ = __;
```

* this 指向window， 所以指向 new __(obj)。
* new __(obj) 中，this指向实例对象 执行 this.\_wrapped = obj, 函数执行结束
* __([1,2,3]) 返回一个对象 为 { \_wrapped: [1, 2, 3] } 该对象的原型指向 _.prototype



**但是上面的函数不能**



























