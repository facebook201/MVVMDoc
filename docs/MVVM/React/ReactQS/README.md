# React相关问题

## setState

* setState方法调用，组件一定会重新渲染吗？


## React为什么不建议用mixins


### Mixins的隐式依赖

* ES6 classes 不支持 Mixins
* Mixins将会修改 state，所以开发者无法直接确定state来自哪里，如果使用多个Mxins更是如此
* 多个Mixins使用时，设定或修改state将会造成命名冲突

HOC是一个比较推崇的方法来替代HOC，但是 HOC也无法直接确定state 或 props来源的问题，HOC中的函数将组件 warp之后 变得不那么一目了然。
同样 当两个HOC使用同一个props时，仍然会造成命名冲突。而且React无法对props命名冲突给出警告。

而且 Mixins和HOCS都面临这样一个问题，使用静态组合代替动态组合，
