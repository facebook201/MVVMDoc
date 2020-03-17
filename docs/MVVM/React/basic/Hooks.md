# Hook


> **Hook 明确了你可以不在编写类组件的情况下，使用state以及其他React特性。只要 Class组件能实现的，函数式组件 + Hookd 都能胜任**

## 动机

* 在组件之间复用状态逻辑很难
* 复杂组件变得难以理解
* class让开发人员和计算机都难以理解

函数组件没有this，不能分配或读取 this.state。可以直接在组件中调用 useState Hook。



#### 调用useState方法的时候做了什么

定义了一个state变量，这个变量可以由我们随便定义。它跟类组件的state是一样的，但是这个变量不会在函数退出后消失。会被React保留。



#### useState 需要哪些参数？

唯一的参数就是初始state。 需要几个变量就调用几次 useState。



#### useState 方法的返回值是什么？

当前state和更新state的函数。 需要成对获取它们。





### Effect Hook

*Effect Hook* 可以让你在函数组件中执行副作用操作，数据获取，设置订阅以及手动更改 React 组件中的 DOM 都属于副作用。不管你知不知道这些操作，或是“副作用”这个名字，应该都在组件中使用过它们。
