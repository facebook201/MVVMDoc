# Vue全局API



## Vue.extend（option）

**使用基础Vue构造器，创建一个子类，参数是组件选项的对象。** 他创建的是一个构造器 而不是实例，需要通过new的方式 挂载到指定元素上使用。



### 为什么使用extend



我们一般情况下初始化根实例之后，所有页面基本上都是router来管，组件也是通过import来进行局部注册，所以组件的创建我们不需要关注，但是也有几个缺点:



* 组件模块是事先定义好的，如果要从接口动态渲染怎么办
* 所有内容都是在 #app下渲染，注册组件都是在当前位置渲染，如果我要实现一个类似于window.alert() 提示组件要求像js函数一样调用它



这时候可以使用 Vue.extend + vm.$mount 组合



```js
import Component from './xx.vue'

const LoadingConstructor = Vue.extend(loadingVue);
let instance = new LoadingConstructor();

parent.appendChild(instance.$el);
```



