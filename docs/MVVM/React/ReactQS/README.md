# React相关问题

## setState 更新状态？

* 什么时候同步，什么时候异步？
* setState方法调用，组件一定会重新渲染吗？

**在React中，如果由React引发的事件处理（onClick引发的事件处理）调用setState不会同步更新，除此之外的setState调用会同步执行this.state**

> 在React的setState函数实现中，会根据一个变量isBatchingUpdates判断是直接更新this.state还是放到队列中回头再说，而isBatchingUpdates默认是false，也就表示setState会同步更新this.state，但是，有一个函数batchedUpdates，这个函数会把isBatchingUpdates修改为true，而当React在调用事件处理函数之前就会调用这个batchedUpdates，造成的后果，就是由React控制的事件处理过程setState不会同步更新this.state。


## React为什么不建议用mixins


### Mixins的隐式依赖

* ES6 classes 不支持 Mixins
* Mixins将会修改 state，所以开发者无法直接确定state来自哪里，如果使用多个Mxins更是如此
* 多个Mixins使用时，设定或修改state将会造成命名冲突

HOC是一个比较推崇的方法来替代HOC，但是 HOC也无法直接确定state 或 props来源的问题，HOC中的函数将组件 warp之后 变得不那么一目了然。
同样 当两个HOC使用同一个props时，仍然会造成命名冲突。而且React无法对props命名冲突给出警告。

而且 Mixins和HOCS都面临这样一个问题，使用静态组合代替动态组合，





## Cannot find module ‘babel-eslint‘

babel-eslint 和 eslint 要一起装。 在react配合typescript一起使用的时候需要在eslint里面加上babel-eslint的解析。

```js
module.exports = {
  parserOptions: {
    ecmaVersion: 6, // ECMAScript版本，7为ES7
    sourceType: "module", //默认script，如果代码是ECMAScript模块，设置为module
  },
  parser: "babel-eslint",
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  globals: {
    document: true,
    navigator: true,
    window:true,
    node:true
  },
  plugins: ["react", "jsx-a11y", "import"],
  // 定制自己的规则
  rules: {
    strict: 0
  }
};
```



