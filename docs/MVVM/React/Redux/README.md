# Redux 简单教程

## Flux 单向数据流图

```javascript
                 _________               ____________               ___________
                |         |             |            |             |           |
                | Action  |------------▶| Dispatcher |------------▶| callbacks |
                |_________|             |____________|             |___________|
                     ▲                                                   |
                     |                                                   |
                     |                                                   |
 _________       ____|_____                                          ____▼____
|         |◀----|  Action  |                                        |         |
| Web API |     | Creators |                                        |  Store  |
|_________|----▶|__________|                                        |_________|
                     ▲                                                   |
                     |                                                   |
                 ____|________           ____________                ____▼____
                |   User       |         |   React   |              | Change  |
                | interactions |◀--------|   Views   |◀-------------| events  |
                |______________|         |___________|              |_________|
```

## 图谱解析
获取数据是一个action，一个点击是一个action，一个input变化也是一个action。不同于直接修改 Model和View，Flux确保所有action首先通过一个dispatcher，然后再是store，最后通知所有的store监听器。
Store只能被action修改，别无他选。并且当所有Store响应了action之后，View才会最终更新。所以数据总是沿着一个方向流动：
**action -> store -> view -> action -> store -> view -> action ->**

## action-creator 

```javascript
// action-creator 就是个函数
const actionCreator = function() {
  // 负责构建一个action 并且返回它
  return {
    type: 'AN_ACTION'
  };
};
```
action的格式，一般是一个拥有type属性的对象。然后按type决定如何处理action，它还有其他的属性，可以存放任意想要的数据。action creator 实际上可以返回 action 以外的其他东西，比如一个函数。这在处理异步时很有用。

直接调用 action creator，如同预期的一样，我们会得到一个 action：
console.log（actionCreator())
// 输出： { type: 'AN_ACTION' }

在实际的场景中，我们需要的是将 action 发送到某个地方，让关心它的人知道发生了什么，并且做出相应的处理。我们将这个过程称之为“分发 action（Dispatching an action）”。

为了分发action，需要一个分发函数。并且为了任何对它感兴趣的人都能感知到action发起。

## State 相关
我们把应用程序的数据称之为状态，我们所说的数据会随着时间的推移发生变化，这就是应用的状态。Redux 就是一个容纳状态的容器。

### 怎么修改这些数据
reducer 函数修改数据，reducer是action的订阅者， Reducer只是一个纯函数，接受应用程序的当前状态以及发生的action，然后返回修改后的新状态。使用订阅者来变更传播数据到整个应用程序。

### Redux提供了？
* 存放应用程序状态的容器
* 一种吧action分发到状态修改器的机制、也就是reducer函数
* 监听状态变化的机制

### 实例
我们把Redux实例称为 store 并用下面的方式创建：
```javascript
import { createStore } from 'redux';
var store = createStore();

// 但是当你运行上述代码，你会发现以下异常消息：Error: Invariant Violation: Expected the reducer to be a function. 因为 createStore 函数必须接收一个能够修改应用状态的函数。

var store = createStore(() => {})
```