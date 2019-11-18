# React 文档


## 函数组件和类组件

* 类组件可以使用其他特性 例如 state 生命周期钩子
* 当组件只是接收 props渲染页面，就是无状态组件。仅仅做展示使用
* 函数组件性能高于类组件，类组件需要实例化 函数只要执行返回结果即可


## props 和 state

* props是外部传进来的 不能修改
* state 是自己维护的 可以改变
* 没有state的叫做无状态组件 可以改写成函数组件
* 多用函数组件 少些state



## 生命周期函数

在16版本发布之后，跟以前的版本有点不同的是，引入了React Fiber。这个东西简单来说就是对React核心算法的一次重新实现。

:::tip React的更新机制
16之前的React更新是同步更新的，举个例子。如果在一个复杂组件的顶层组件更改了state。那么调用栈就会很长。就会导致主线程长时间阻塞。有不好的用户体验。现在的版本使用的一个方法是 切片。把一个耗时很长的任务分成很多小片，每一个小片运行时间很短。每次执行之后会给其他任务一个执行的机会。这样唯一的线程就不会被独占，其他任务依然有运行的机会。
:::

![border](https://pic1.zhimg.com/80/v2-78011f3365ab4e0b6184e1e9201136d0_hd.png)

### Fiber对生命周期的影响

因为Fiber的机制是优先级高的更新任务会优先处理完，低优先级的会被打断，所以Fiber一个更新过程会被分为两个阶段（Phase）：第一个阶段Reconciliation Phase和 Commit Phase。

第一个阶段 react 会找出哪些需要更新的DOM，这个阶段是可以被打断的，第二个阶段是 Commit Phase 一口气DOM更新完 不会打断。

### 第一个阶段的函数

* componentWillMount
* componentWillReceiveProps
* shouldComponentUpdate
* componentWillUpdate

### 第二阶段

* componentDidMount
* componentDidUpdate
* componentWillUnmount

在React Fiber中，第一阶段中的生命周期函数在一次加载和更新过程中可能会被多次调用！
在React的 V16.3中。引入了两个新的生命周期函数：

* getDerivedStateFromProps 取代 componentWillReceiveProps
* getSnapshotBeforeUpdate 取代  componentWillUpdate

16.3之前的生命周期

![border](https://hackernoon.com/hn-images/1*sn-ftowp0_VVRbeUAFECMA.png)

上面的生命周期图，看起来非常对称。

* Initialization 初始化阶段
* Mounting       挂载阶段
* Updation       更新阶段
* Unmounting     组件卸载阶段


### 新的生命周期组件
getDerivedStateFromProps是一个静态函数，所以函数体内不能访问this，简单说，就是应该一个纯函数，纯函数是一个好东西啊，输出完全由输入决定。每当父组件引发当前组件的渲染过程时，getDerivedStateFromProps会被调用，这样我们有一个机会可以根据新的props和之前的state来调整新的state，如果放在三个被deprecate生命周期函数中实现比较纯，没有副作用的话，基本上搬到getDerivedStateFromProps里就行了；如果不幸做了类似AJAX之类的操作，首先要反省为什么自己当初这么做，然后搬到componentDidMount或者componentDidUpdate里面去。


React v16.3还引入了一个新的声明周期函数getSnapshotBeforeUpdate，这函数会在render之后执行，而执行之时DOM元素还没有被更新，给了一个机会去获取DOM信息，计算得到一个snapshot，这个snapshot会作为componentDidUpdate的第三个参数传入。

```javascript
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('#enter getSnapshotBeforeUpdate');
    return 'foo';
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('#enter componentDidUpdate snapshot = ', snapshot);
  }
```

```jsx
class ExampleComponent extends React.Component {
  // 用于初始化 state
  constructor() {}
  // 用于替换 `componentWillReceiveProps` ，该函数会在初始化和 `update` 时被调用
  // 因为该函数是静态函数，所以取不到 `this`
  // 如果需要对比 `prevProps` 需要单独在 `state` 中维护
  static getDerivedStateFromProps(nextProps, prevState) {
    //根据nextProps和prevState计算出预期的状态改变，返回结果会被送给setState
  }
  // 判断是否需要更新组件，多用于组件性能优化
  shouldComponentUpdate(nextProps, nextState) {}
  // 组件挂载后调用
  // 可以在该函数中进行请求或者订阅
  componentDidMount() {}
  // 用于获得最新的 DOM 数据
  getSnapshotBeforeUpdate() {}
  // 组件即将销毁
  // 可以在此处移除订阅，定时器等等
  componentWillUnmount() {}
  // 组件销毁后调用
  componentDidUnMount() {}
  // 组件更新后调用
  componentDidUpdate() {}
  // 渲染组件函数
  render() {}
  // 以下函数不建议使用
  UNSAFE_componentWillMount() {}
  UNSAFE_componentWillUpdate(nextProps, nextState) {}
  UNSAFE_componentWillReceiveProps(nextProps) {}
}
```



## setState 方法

* 不要直接去更改状态、setState不会立刻改变React组件中的state的值
* 状态更新可能是异步的
* 多次setState函数会产生的效果合并
* setState会引发一次组件的更新过程来引发重新绘制


当setState被调用时，能驱动组件的更新过程，引发componentDidUpdate、render等一系列函数的调用。

### **setState的更新**
setState不会立刻改变React组件中的state的值


```javascript
this.setState({counter: this.state.counter + 1});
this.setState({counter: this.state.counter + 1});
this.setState({counter: this.state.counter + 1});

```
看起来加了三次，但是实际上只会加一次。那么问题来了，什么时候会修改？

**setState通过引发组件更新的重新绘制**

setState调用引起的React的更新生命周期函数。知道render函数被调用的时候，this.state 才得到更新。
(或者，当shouldComponentUpdate函数返回false，这时候更新过程就被中断了，render函数也不会被调用了，这时候React不会放弃掉对this.state的更新的，所以虽然不调用render，依然会更新this.state。）
连续调用了两次this.setState，但是只会引发一次更新生命周期，不是两次，因为React会将多个this.setState产生的修改放在一个队列里，缓一缓，攒在一起，觉得差不多了再引发一次更新过程。


### 函数式的setState用法
this.setState的参数可以接收一个函数参数。该函数将接收先前的状态作为第一个参数，将此次更新被应用时的props做为第二个参数

```javascript
// Correct
this.setState((prevState, props) => ({
  counter: prevState.counter + props.increment
}));
```


