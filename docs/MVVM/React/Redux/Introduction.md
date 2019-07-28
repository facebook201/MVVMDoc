# React 核心内容

React对象本身很简单 他就是一个javascript对象。
```javascript
// State
{
  todos: [{
    text: 'Eat food',
    completed: true
  }, {
    text: 'Exercise',
    completed: false
  }],
  visibilityFilter: 'SHOW_COMPLETED'
}
```
这个对象就像 “Model”，区别是它并没有 setter（修改器方法), 这样就不能随意的修改。要想更新 state 中的数据，你需要发起一个 action。Action 就是一个普通 JavaScript 对象。

```javascript
// Action
{ type: 'ADD_TODO', text: 'Go to swimming pool' }
{ type: 'TOGGLE_TODO', index: 1 }
{ type: 'SET_VISIBILITY_FILTER', filter: 'SHOW_ALL' }
```

强制使用 action 来描述所有变化带来的好处是可以清晰地知道应用中到底发生了什么。如果一些东西改变了，就可以知道为什么变。
把action 和 state 串起来的函数叫 reducer。它只是接收一个state和action。并返回新的 state 的函数

```javascript
// Reducer
function visibilityFilter(state = 'SHOW_ALL', action) {
  if (action.type === 'SET_VISIBILITY_FILTER') {
    return action.filter
  } else {
    return state
  }
}

function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([{ text: action.text, completed: false }])
    case 'TOGGLE_TODO':
      return state.map((todo, index) =>
        action.index === index
          ? { text: todo.text, completed: !todo.completed }
          : todo
      )
    default:
      return state
  }
}
```

## 三大原则

### 单一数据源
整个应用的 state 被储存在一颗 Object tree 中，并且在这个 Object tree只存在于一个唯一的 store中。获取state的方法是 **store。getState()**


### State是只读的
唯一改变state的方法就是触发 action，action是一个用于描述已发生事件的普通对象。
```javascript
store.dispatch({
  type: 'COMPLETE_TODO',
  index: 1
});

store.dispatch({
  type: 'SET_VISIBILITY_FILTER',
  filter: 'SHOW_COMPLETED'
});
```

### 使用纯函数来执行修改
Reducer只是 一些纯函数，接收先前的state和action，返回新的state。刚开始你可以只有一个reducer，随着应用变大 可以把它拆成多个小的 reducers，分别独立操作state tree的不同部分


## Action

Action 是把数据从应用传到 store的有效载荷，它是store数据的唯一来源。一般来说你会通过 store.dispatch() 将 action 传到 store。
```javascript
const ADD_TODO = 'ADD_TODO';
{
  type: ADD_TODO,
  text: 'Build my first Redux app'
}
```
Action本质上是JavaScript普通对象，action内必须使用一个字符串类型的 type 字段来表示要执行的动作，type多数的情况下会被定义成字符串常量，当应用规模越来越大的时候，建议使用单独的模块来存放action。
```javascript
import { ADD_TODO, REMOVE_TODO } from '../actionTypes';
```

## Action 创建函数
Action 创建函数就是生成 action的方法。它就是简单的返回一个action：
```javascript
function addTodo(text) {
  return {
    type: ADD_TODO,
    text
  };
}
// Redux 只需要把 action创建函数的结果传给 dispatch（） 方法即可发起一次dispatch
dispatch(addTodo(text))
```

## Reducer
指定了应用状态的变化如何响应 actions 并发送到store的， actions 只是描述了有事情发生了这一事实，并没有描述应用如何更新state。 reducer 就是一个纯函数，接受旧的state和action 返回新的state。


* 不要修改reducer函数传入的函数
* 执行有副作用的操作 
* 调用非纯函数 

**只要传入参数相同，返回计算得到的下一个state就一定相同。没有特殊情况、没有副作用、没有API请求、没有变量修改、单纯执行计算。**
```javascript

const initialState = {
  visibilityFilter: VisibilityFilters.SHOW_ALL,
  todos: []
};

function todoApp(state, action) {
  if (typeof state === 'undefined') {
    return initialState;
  }
  // 返回传入的state
  return state;
}

function todoApp(state = initialState, action) {
  return state;
}
```

* 不要修改state, 可以使用对象展开运算符 { ...state, ...newState }
* 在default的情况下 返回旧的state

一个大型的应用 会有多个reducer，他们各自管理自己的那一部分。每个reducer的state参数都不同，分别对应它管理的那部分state 数据。

**combineReducers()做的只是生成一个函数，这个函数来调用你的一系列 reducer，每个 reducer 根据它们的 key 来筛选出 state 中的一部分数据并处理，然后这个生成的函数再将所有 reducer 的结果合并成一个大的对象。如其他 reducers，如果 combineReducers() 中包含的所有 reducers 都没有更改 state，那么也就不会创建一个新的对象。**

## Store 

action用来描述发生了什么，reducers根据action更新state，store就是把他们联系到一起的对象。

* 维持应用的 state
* 提供getState() 方法获取state
* 提供dispatch(action)方法更新state
* 通过 subscribe(listener)注册监听器
* 通过 subscribe(listener)返回的函数注销侦听器

**Redux应用只有一个stroe**，如果要拆分数据处理逻辑，要使用reducer组合 而不是创建多个store。

```javascript
import { createStore } from 'redux';
import todoApp from './reducers';

let store = createStore(todoApp);
//
let store = createStore(todoApp, window.STATE_FROM_SERVER);
```
createStore() 的第二个参数是可选的, 用于设置 state 初始状态。这对开发同构应用时非常有用，服务器端 redux 应用的 state 结构可以与客户端保持一致, 那么客户端可以将从网络接收到的服务端 state 直接用于本地数据初始化。


## 发起 Actions



















