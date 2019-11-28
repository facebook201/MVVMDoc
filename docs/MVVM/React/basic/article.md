# React好的文章

## 性能、优化你的React组件（政采云）

React基于虚拟DOM和高效Diff算法虽然实现DOM的最小粒度的更新。大多数情况下React对DOM的渲染效率足以我们的日常业务。但是复杂的业务场景下，性能问题依然会需要优化来提升运行性能，**很重要的一点就是避免不必要的渲染（render）**


### render 何时会被触发

* 组件挂载 
React组件构建并将DOM元素插入页面的过程，组件首次渲染的时候会调用 无法避免。

* setState 方法调用

setState是React中最常用的命令，通常情况下，执行setState会触发render。**执行setState的时候一定会重新渲染吗**

