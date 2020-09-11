# 理解Redux





## React 有什么

* React 有 props和state，props 是父级分发下来的属性，state 是组件内部可以自行管理的状态，并且整个React 没有数据向上回溯的能力，也就是数据只能单向向下分发 或者内部自己消化
* 有时候我们发现两个组件无法使用对方的数据，这时候我们只能提升state，将其放到共有的父组件中来管理，再作为 props 分发回子组件
* 子组件改变父组件state的办法只能是通过onClick触发父组件声明好的回调，也就是父组件提前声明好函数或方法作为契约描述自己的state将如何变化，再将它同样作为属性交给子组件使用。
  这样就出现了一个模式：数据总是单向从顶层向下分发的，但是只有子组件回调在概念上可以回到state顶层影响数据。这样state一定程度上是响应式的。
* 为了避免所有的扩展问题，最容易的办法就是 把state 集中放到组件顶层，然后分发给所有组件。



## Redux



a、需要回调通知 state（等同于回调参数）=> action

b、需要根据回调处理 （等同于父级方法）=> reducer

c、需要 state （等同于总状态）=> store

> * **action 是纯声明式的数据结构、只提供事件的所有要素，不提供逻辑**
>
>   
>
> * **reducer 是一个匹配函数，action的发送是全局的，所有的reducer都可以捕捉到并匹配与自己相关与否，相关就拿走action中的要素进行逻辑处理，修改 store中的状态，不相关就不对 state 做处理 原样返回。**
>
>   
>
> * **reducer 必须是纯函数，纯函数指的是，给定固定的输入，就一定会有固定的输出，而且不会有任何副作用，如果一个函数里边有 ajax 等异步操作,或者与日期相关的操作之后，他都不是一个纯函数，副作用是指对传入的参数进行修改**
>
>   
>
> * **store 负责存储状态 可以被 react api回调 发布 action 还有一个 binding 库 react-redux**
>
>   
>
>   **React-Redux 提供了一个 Provider 是一个普通组件，作为顶层App的分发点，只需要store属性，内部限制只能嵌套一个子组件，将state分发给所有被connect的组件，不管它在哪，被嵌套多少层。**
>
>   
>
>   **connect是真正的重点，它是一个柯里化函数，意思是先接受两个参数（数据绑定mapStateToProps和事件绑定mapDispatchToProps），再接受一个参数（将要绑定的组件本身）**
>
>   
>
> * **mapStateToProps：构建好Redux系统的时候，它会被自动初始化，但是你的React组件并不知道它的存在，因此你需要分拣出你需要的Redux状态，所以你需要绑定一个函数，它的参数是state，简单返回你关心的几个值。**
>
>   
>
> * **mapDispatchToProps：声明好的action作为回调，也可以被注入到组件里，就是通过这个函数，它的参数是dispatch，通过redux的辅助方法bindActionCreator绑定所有action以及参数的dispatch，就可以作为属性在组件里面作为函数简单使用了，不需要手动dispatch。这个mapDispatchToProps是可选的，如果不传这个参数redux会简单把dispatch作为属性注入给组件，可以手动当做store.dispatch使用。这也是为什么要科里化的原因。**
>
>   









