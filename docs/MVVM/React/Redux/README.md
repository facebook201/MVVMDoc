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
* 一种把action分发到状态修改器的机制、也就是reducer函数
* 监听状态变化的机制

### 实例
我们把Redux实例称为 store 并用下面的方式创建：
```javascript
import { createStore } from 'redux';
var store = createStore();

// 但是当你运行上述代码，你会发现以下异常消息：Error: Invariant Violation: Expected the reducer to be a function. 因为 createStore 函数必须接收一个能够修改应用状态的函数。

var store = createStore(() => {})
```

## Reducer
创建一个Redux的实例，管理应用中的state。看看Reducer是怎么转换state的。
在之前的图里面，只有 Store，没有Reducer。那么Store与Reducer到底有什么区别？
**Store可以保存你的data，但是Reducer不能。在传统的 Flux 中，Store 本身可以保存 state，但在 Redux 中，每次调用 reducer时，都会传入待更新的 state。这样的话，Redux 的 store 就变成了“无状态的 store” 并且改了个名字叫 Reducer。**

所以在上面的实例前，创建一个Redux实例前，需要给它一个 reducer 函数。每当一个action发生的时候，Redux都能调用这个函数，往 createStore 传Reducer的过程
就是给 Redux 绑定 action 处理函数（也就是reducer）的过程。

```javascript
const reducer = function(...args) {
  console.log('Reducer was called with args', args);
};

const store = createStore(reducer);
```
reducer被调用了，但是没有dispatch任何action，这是因为初始化应用state的时候，dispatch 了一个初始化的 action（{ type: '@@redux/INIT' })。
在被调用的时候，一个 reducer 会得到这些参数 (state, action),初始化的时候state是undefined。处理 init action之后。会怎样呢？

## get_State
怎么从 Redux 中读取 state？

```javascript
import { createStore } from 'redux';

const reducer = function(state, action) {
  console.log('reducer was called with state', state, action);
};
const store = createStore(reducer);
// 输出: reducer_0 was called with state undefined and action { type: '@@redux/INIT' }
console.log('store_0 state after initialization:', store_0.getState());
// 输出: store_0 state after initialization: undefined
```
为了读取 Redux 保存的 state，可以调用 getState。 reducer 只是一个函数，接收到程序当前的state和action，然后返回一个modify过的心的 state。我们的reducer目前什么都不返回，所以程序的state当然只能是 reducer() 返回的那个叫 undefined 的东西。

```javascript
const reducer = function (state = {}, action) {
  return state;
};

const store = createStore(reducer);
```
调用  reducer ，只是为了响应一个派发来的 action，接下来，我们在 response 里模拟一个 state 修改，其响应的 action 类型是 'SAY_SOMETIHG'。

```javascript
const reducer = function(state = {}, action) {
  switch(action.type) {
    case 'SAY_SOMETHING':
      return {
        ...state,
        message: action.value
      };
      break;
    default:
      return state;
  }
};

const store = createStore(reducer);
```
0) 我假设了 action 里一定包含了一个 type 跟一个 value 。type 基本上是 flux action 已经约定俗成的， 而 value 属性可以是任何类型的。
1) 这里有个常见模式：在 reducer 里用 switch 来响应对应的 action 。
2) 用 switch 的时候， **永远** 不要忘记放个 “default” 来返回 “state”，否则，你的 reducer 可能会返回 “undefined” （等于你的 state 就丢了）
3) 注意 { message: action.value } 是怎么被合并到当前 state 来形成新 state 的，这全要感谢牛逼的 ES7 notation (Object Spread): { ...state, message: action.value }
4) 还要注意：之所以这个例子能用ES7 Object Spread notation ，是因为它只对 state 里的{ message: action.value} 做了浅拷贝（也就是说， state 第一个层级的属性直接被 { message: action.value } 覆盖掉了 —— 与之相对，其实也有优雅的合并方式 ）但是如果数据结构更复杂或者是嵌套的，那处理state更新的时候，很可能还需要考虑一些完全不同的做法：
  - 可以考虑： Immutable.js (https://facebook.github.io/immutable-js/)
  - 可以考虑： Object.assign (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  - 可以考虑： 手工合并
   - 又或者考虑用其它任何能满足需要且适合 state 结构的方法，Redux 对此是全无预设的方式的（要记得 Redux 只是个状态的容器）。

下面要在 reducer 里处理 action 了，我们将会有多个 reducer 并会组合它们。

## 多个action的reducer
```javascript
const reducer_1 = function (state = {}, action) {
    switch (action.type) {
        case 'SAY_SOMETHING':
            return {
                ...state,
                message: action.value
            }
        case 'DO_SOMETHING':
            // ...
        case 'LEARN_SOMETHING':
            // ...
        case 'HEAR_SOMETHING':
            // ...
        case 'GO_SOMEWHERE':
            // ...
        // etc.
        default:
            return state;
    }
}
```
如果一个reducer去维护整个项目，项目就会变得很很难维护，所以如果有多个reducer，Redux会帮我们合并reducer。
```javascript
var userReducer = function (state = {}, action) {
    switch (action.type) {
        // etc.
        default:
            return state;
    }
}
var itemsReducer = function (state = [], action) {
    switch (action.type) {
        // etc.
        default:
            return state;
    }
}
```
不同的reducer是可以接收不同类型的state，数据结构作为 state 的值。（例如，字面量对象、数组、布尔值、字符串或其它不可变结构）。多个reducer的模式下，可以让每个reducer只处理整个应用的部分 state。那么怎么合并所有的reducer，如何告诉Redux 每个 reducer 只处理一部分state呢？ combineReducers辅助函数。 

**combineReducers 接收一个对象并返回一个函数，当combineReducers 被调用时，它会去调用每个reducer，并把返回的每一块 state 重新组合成一个大的state对象，也就是Redux中的Store。**

```javascript
import { createStore, combineReducers } from 'redux'

var reducer = combineReducers({
    user: userReducer,
    items: itemsReducer
});

var store_0 = createStore(reducer)
```
从输出中看到的，每个 reducer 都被正确地调用了（但接收了个 init action @@redux/INIT ）。这个 action 是什么鬼？这是 combineReducers 实施的一次安全检查，用以确保 reducer 永远不会返回undefined。请注意，在 combineReducers 中第一次调用 init action 时，其实是随机 action 来的，但它们有个共同的目的 (即是做一个安全检查)。

Redux 正确处理了 state 的各个部分。最终的 state 完全是一个简单的对象，由userReducer 和 itemsReducer 返回的部分 state 共同组成。
```javascript
{
  user: {},
  items: []
}
```
由于我们为每个 reducer 初始化了一个特殊的值（userReducer 的是空对象 {} ，itemsReducer 的是空数组 [] ）,所以在最终 Redux 的 state 中找到那些值并不是巧合。

## dispatch 分发
```javascript
var userReducer = function (state = {}, action) {
    switch (action.type) {
        case 'SET_NAME':
            return {
                ...state,
                name: action.name
            }
        default:
            return state;
    }
}
var itemsReducer = function (state = [], action) {
    switch (action.type) {
        case 'ADD_ITEM':
            return [
                ...state,
                action.item
            ]
        default:
            return state;
    }
}

import { createStore, combineReducers } from 'redux'
var reducer = combineReducers({
    user: userReducer,
    items: itemsReducer
});
var store = createStore(reducer);
store.getState(); // { user: {}, items: [] }
```
现在来dispatch第一个action，**为了dispatch一个action，需要一个dispatch函数**。我们所看到的dispatch函数，是redux提供的，并且它会将action传递给任何一个reducer！dispatch本质上是 Redux的实例的属性 ”dispatch“

```javascript
store_0.dispatch({
    type: 'AN_ACTION'
});
// userReducer was called with state {} and action { type: 'AN_ACTION' }
// itemsReducer was called with state [] and action { type: 'AN_ACTION' }
{ user: {}, items: [] }

var setNameActionCreator = function (name) {
    return {
        type: 'SET_NAME',
        name: name
    }
}
store.dispatch(setNameActionCreator('bob'))
{ user: { name: 'bob' }, items: [] }
```
每一个 reducer 都被调用了，但是没有一个 action type 是 reducer需要的。因此state是不会发生变化。上面我们处理了一个action，然后改变了应用的state。
目前的流程是这样的 ActionCreator -> Action -> dispatcher -> reducer

## dispatch async action

假设现在有一个场景：
1) 用户点击 "Say Hi in 2 seconds 按钮"
2) 当用户点击按钮A，我们希望经过两秒，视图显示一条消息 Hi。
3) 两秒过去之后 视图更新 显示消息

```javascript
import { createStore, combineReducers } from 'redux';

var reducer = combineReducers({
  speaker: function(state = {}, action) {
    switch(action.type) {
      case 'SAY':
        return {
          ...state,
          message: action.message
        };
        default:
          return state;
    }
  }
});

var store = createStore(reducer);

var sayActionCreator = function(message) {
  return {
    type: 'SAY',
    message
  };
};
```