# Vue构造器

Vue的本质是以构造器，只能通过new的方式使用。

```js
(function (global, factory) {
  // 遵循UMD规范
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vue = factory());
}(this, function () { 'use strict';
  ···
  // Vue 构造函数
  function Vue (options) {
    // 保证了无法直接通过Vue()去调用，只能通过new的方式去创建实例
    if (!(this instanceof Vue)
    ) {
      warn('Vue is a constructor and should be called with the `new` keyword');
    }
    this._init(options);
  }
  return Vue
})
```



## 构造器的默认选项

实例化Vue的时候， 会传选项对象到构造器进行初始化，这个选项对象描述了你想要的行为。例如data，计算属性，components等。但是Vue内部会有一些默认选项。initGlobalAPI 方法中有几个默认选项定义。























