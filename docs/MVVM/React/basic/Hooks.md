# Hook


> **Hook 明确了你可以不在编写类组件的情况下，使用state以及其他React特性。只要 Class组件能实现的，函数式组件 + Hookd 都能胜任**


## React 组件设计理念

* React 认为，UI 视图是数据的一种视觉映射，即 UI = F(Data)。 F函数主要是对输入数据 **进行加工、并对数据的变更做出响应。**
* F 抽象成函数组件， React是以组件为粒度编排的应用 组件是代码复用最小的单元
* React 采用 Props属性接收外部数据，使用 state 属性来管理组件自身的数据，为了实现对数据变更做出响应需要，采用了**基于 Class 的组件设计**
* React被认为组件是有生命周期的，因此引入组件的 created 到 destory 一系列的API

### Class Component 的问题

组件之间的联系，一方面是数据的共享，另一个是功能的复用。

* 对于组件之间的数据共享问题，React 官方采用单向数据流
* 有状态的组件复用，从开始的 createClass + Mixins，后来的 Class Component，后面又有 Render Props、Higher Order Component，再到现在的 Function Component + Hooks。

### 高阶组件的问题

* 嵌套地狱 每一次HOC调用都会创建一个实例
* 可以使用类装饰器缓解组件嵌套带来的可维护性问题，但装饰器本质上还是 HOC
* 包裹太多层级之后，props可能会覆盖

### Render Props 

* 数据流更加直观，子孙组件可以很明确的看到数据来源
* 本质上 Render Props 是基于闭包实现的。大量地使用会引入 回调地狱的问题
* 丢失组件的上下文，没有 this.props 属性，不能向 HOC那样访问 this.props.children


### Function Component

函数组件虽然方便使用和测试，但是只能单纯的接收 props、绑定事件 返回jsx。本身是**无状态的组件，依赖传进来的props来响应数据的变更，所以Function Component不能脱离Class 组件来存在。** 所以函数组件是否能脱离类组件独立存在，关键在于让函数组件自身具备状态处理能力。**组件在首次render之后，组件自身能够通过某种机制再次触发状态的变更引起re-render** 这种机制就是 Hooks！





## 动机 (为什么引入Hooks)

* 在组件之间复用状态逻辑很难
* 复杂组件变得难以理解
* class让开发人员和计算机都难以理解

函数组件没有this，不能分配或读取 this.state。可以直接在组件中调用 useState Hook。


## Hook 规则

React Hook 本质上是JavaScript函数。使用hooks 最好引入官方的 linter插件。

### **在最顶层使用Hook**

**不要在循环，条件或嵌套函数中调用 Hook **，确保在React 函数顶层调用。遵守这条规则，你就能确保 Hook 在每一次渲染中都按照同样的顺序被调用。这让 React 能够在多次的 useState 和 useEffect 调用之间保持 hook 状态的正确。

```js
// Eslint 配置
{
  "plugins": [
    // ...
    "react-hooks"
  ],
  "rules": {
    // ...
    "react-hooks/rules-of-hooks": "error", // 检查 Hook 的规则
    "react-hooks/exhaustive-deps": "warn" // 检查 effect 的依赖
  }
}
```



#### 调用useState方法的时候做了什么
定义了一个state变量，这个变量可以由我们随便定义。它跟类组件的state是一样的，但是这个变量不会在函数退出后消失。会被React保留。



#### useState 需要哪些参数？

唯一的参数就是初始state。 需要几个变量就调用几次 useState。



#### useState 方法的返回值是什么？

当前state和更新state的函数。 需要成对获取它们。





### Effect Hook

*Effect Hook* 可以让你在函数组件中执行副作用操作，数据获取，设置订阅以及手动更改 React 组件中的 DOM 都属于副作用。不管你知不知道这些操作，或是“副作用”这个名字，应该都在组件中使用过它们。