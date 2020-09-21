# React 源码



## 理念

React 的 调用栈分三个层次

- Scheduler（调度器）—— 调度任务的优先级，高优任务优先进入**Reconciler**
- Reconciler（协调器）—— 负责找出变化的组件
- Renderer（渲染器）  —— 负责将变化的组件渲染到页面上



**React意在 构建快速响应的大型Web应用程序。所以最重要的问题就是解决 CPU 和 IO 的瓶颈问题。也就是新版的并发的更新模式代替以前的同步更新模式。Fiber架构能实现并发更新。**





## 源码学习三个阶段



* 首先从 Build you Own React [https://pomb.us/build-your-own-react/]
* 熟悉到 React的理念
* 参考别人的React源码解析
* 自己从头到尾认真的读一遍

























































## Fiber 架构

































## 定义
React Hook 从具象来说就为函数组件（纯函数）提供副作用能力的 React API，确定状态源的解决方案。



* 在组件之间复用状态逻辑很难（高阶组件、render props 代码难以理解 嵌套深）
* 复杂组件难以理解
* class 难以理解 this指向



## Hook 是如何保存数据

FC 的 render 本身只是函数调用，**每个组件都有对应的 fiber 节点（可以理解为虚拟DOM），用于保存组件相关信息，每次组件 Render时，全局变量`currentlyRenderingFiber`都会被赋值为该`FunctionComponent`对应的`fiber节点`。** 所以 hook 内部其实是从 currentlyRenderingFiber 中获取状态信息的。 

## 多个是怎么保存的

`currentlyRenderingFiber.memoizedState`中保存一条`hook`对应数据的单向链表。

```js
const HookA = {
    // hook 保存的数据
    memoizedState: null,
    // 下一个hook
    next: hookB,
    // 本次更新开始时已经有 update队列
    baseState: null,
    // 本次更新开始有 update 队列
    baseQueue: null,
    // 本次更新需要增加的 update 队列
    queue: null
};

hookB.next = hookC;

currentlyRenderingFiber.memoizedState = hookA;
```

当`FunctionComponent` `render`时，每执行到一个`hook`，都会将指向`currentlyRenderingFiber.memoizedState`链表的指针向后移动一次，指向当前`hook`对应数据。

这也是为什么`React`要求`hook`的调用顺序不能改变（不能在条件语句中使用`hook`） —— 每次`render`时都是从一条固定顺序的链表中获取`hook`对应数据的。

## useState 执行流程

`useState`返回值数组第二个参数为**改变state的方法**。

在源码中，他被称为`dispatchAction`。每当调用`dispatchAction`，都会创建一个代表一次更新的对象`update` 如果是多次， `update`会形成一条环状链表。`update`链表是由某个`useState`的`dispatchAction`产生，那么这条链表显然属于该`useState hook`。

其中，`queue`中保存了本次更新`update`的链表。

在计算`state`时，会将`queue`的环状链表剪开挂载在`baseQueue`最后面，`baseQueue`基于`baseState`计算新的`state`。

在计算`state`完成后，新的`state`会成为`memoizedState`。



> 为什么更新不基于`memoizedState`而是`baseState`，是因为`state`的计算过程需要考虑优先级，可能有些`update`优先级不够被跳过。所以`memoizedState`并不一定和`baseState`相同。



































