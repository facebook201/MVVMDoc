# Hook


> **Hook 明确了你可以不在编写类组件的情况下，使用state以及其他React特性。只要 Class组件能实现的，函数式组件 + Hook 都能胜任**


## React 组件设计理念

* React 认为，UI 视图是数据的一种视觉映射，即 UI = F(Data)。 F函数主要是对输入数据 **进行加工、并对数据的变更做出响应。**
* F 抽象成函数组件， React是以组件为粒度编排的应用 组件是代码复用最小的单元
* React 采用 Props属性接收外部数据，使用 state 属性来管理组件自身的数据，为了实现对数据变更做出响应需要，采用了**基于 Class 的组件设计**
* React被认为组件是有生命周期的，因此引入组件的 created 到 destory 一系列的API

### Class Component 的问题

组件之间的联系，一方面是数据的共享，另一个是功能的复用。

* 对于组件之间的数据共享问题，React 官方采用单向数据流
* 有状态的组件复用，从开始的 createClass + Mixins，后来的 Class Component，后面又有 Render Props、Higher Order Component，再到现在的 Function Component + Hooks。



### 函数组件的缺失问题

* 函数组件是纯函数 利于组件复用和测试
* 函数组件只是单纯的接收 props、绑定事件、返回jsx 本身是无状态的，所以还是依赖props传入的handle来响应数据的变更。所以函数组件不能脱离类组件。



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





### 函数组件和类组件的区别

**在类组件中 我们一般通过 this.props 来读取父组件传来的数据，props是不可变的数据，但是this是永远可变的，所以如果组件重新渲染 this.props 就会改变。**

```jsx
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };

  handleClick = () => {
    setTimeout(this.showMessage, 3000);
  };

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

如果我们父组件改变了user的值，那 定时器返回的数据可能是 ”错误的“。我们可以认为这是props在某个地方弄丢了，切断了this的联系。解决方法有两种：



* 调用事件之前 读取 props.user，显示的传入到函数里（但是代码显得冗长 如果另一个地方也调用了 越来愈多的方法 会更加难以维护）
* JavaScript 闭包来解决





## 动机 (为什么引入Hooks)

* 在组件之间复用状态逻辑很难
* 复杂组件变得难以理解
* class让开发人员和计算机都难以理解

函数组件没有this，不能分配或读取 this.state。可以直接在组件中调用 useState Hook。


## Hook 规则

React Hook 本质上是JavaScript函数。使用hooks 最好引入官方的 linter插件。

### **在最顶层使用Hook**

**不要在循环，条件或嵌套函数中调用 Hook **，确保在React 函数顶层调用。遵守这条规则，你就能确保 Hook 在每一次渲染中都按照同样的顺序被调用。这让 React 能够在多次的 useState 和 useEffect 调用之间保持 hook 状态的正确。


### 使用 React Hooks 之前的要求

#### 1、必须完整的阅读一次 Hook的文档

重点必看hooks: useState、useReducer、useEffect、useCallback、useMemo。Dan的《useEffect完全指南》衍良同学的《React Hooks完全上手指南》

#### 2 工程引入 lint插件 开启规则
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



### 注意点

函数式更新：如果新的state需要先前的state计算得到，那么可以将函数传递给setState。该函数接收先前的 state，返回一个更新后的的值。

```jsx
<button onClick={() => setCount(prevCount => prevCount + 1)}>增加</button>
```

 如果你的更新函数返回值与当前 state 完全相同，则随后的重渲染会被完全跳过。





## Effect Hook

**Effect Hook** 可以让你在函数组件中执行副作用操作，数据获取，设置订阅以及手动更改 React 组件中的 DOM 都属于副作用。不管你知不知道这些操作，或是“副作用”这个名字，应该都在组件中使用过它们。



* effect 每次更新渲染的时候都是一个不同的函数（**记住每一次更新渲染都有自己的所有**）—— 并且每个 effect函数 里面的props 和 state 都是那次属于自己的 特定渲染。effect也是渲染的一部分。

  **更新步骤 很重要**

  *  React给一个初始的state状态
  * 组件本身记住要渲染的内容 和 渲染之后 要调用 这个effect
  * React 告诉浏览器 要给DOM添加一些东西
  * 浏览器就绘制到页面上
  * 最后就是 React 接收到UI界面绘制完成之后 就要运行 effect函数了



#### 清除Effect 副作用 例如取消订阅

如果你的effect返回一个函数，React将会在执行清除操作时调用它。

```jsx
useEffect(() => {
 	return () => {
    ChatApi.unsubscribeFromFriendStatus(props.id, handleFunction);
  } 
});
```



如果有更新操作的时候，Effect 的步骤是

* React 渲染 UI
* 浏览器绘制。我们在屏幕上看到 新数据的 UI
* React 清除老的 effect
* React 运行新的 effect



>*组件内的每一个函数（包括事件处理函数，effects，定时器或者API调用等等）会捕获定义它们的那次渲染中的props和state。*



#### effect 副作用函数第二个参数 依赖 dependency

* 如果是一个空数组 就只会在初次渲染执行一次
* 如果有依赖项 当依赖项变化 effect会在渲染之后再次执行一次





#### useCallback | useMemo



1、在组件内部，那些会成为其他useEffecr依赖项的方法，建议用useCallback包裹，

2、如果函数会作为props传递给子组件，一定使用useCallback 包裹。







# 

## Class 迁移到 Hooks

### 生命周期方法对应 Hook

* constructor 函数组件不需要构造函数。可以通过调用 useState 初始化 state。同事useState 接受一个函数作为参数更新

* `getDerivedStateFromProps`：改为 [在渲染时](https://reactjs.bootcss.com/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops) 安排一次更新。

* `shouldComponentUpdate`：参考 React.memo

* `render`：这是函数组件体本身。

* `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`：[`useEffect` Hook](https://reactjs.bootcss.com/docs/hooks-reference.html#useeffect) 可以表达所有这些(包括 [不那么](https://reactjs.bootcss.com/docs/hooks-faq.html#can-i-skip-an-effect-on-updates) [常见](https://reactjs.bootcss.com/docs/hooks-faq.html#can-i-run-an-effect-only-on-updates) 的场景)的组合。

  

### hooks 获取数据

```tsx
useEffect(() => {
  let ignore = false
  	async function fetchData() {
      setIsLoading(true);
      const ret = await axios();
      if (!ignore) {
        setData(ret.data);  
        setIsLoading(false);
      }
    }
  	fetchData();
  return () => { ignore: false }
}, [query]);
```



### 如何获取上一轮的 props 或 state ？

```ts
function usePrevious(value: any) {
  const ref = React.useRef();
  
  React.useEffect(() => {
    ref.current = value;
  }, []);

  return ref.current;
}

function Counter() {
  const [count, setCount] = React.useState(0);
  const prevCount = usePrevious(count);
  return <h1>Now: {count}, before: {prevCount}</h1>;
}
```







### 



































