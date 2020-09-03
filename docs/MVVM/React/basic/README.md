# React的设计思想



## 声明式编程

### 命令式编程

**通过代码告诉计算机去做什么**

例如 以前js改变dom节点的某个文本，要一步步获取DOM 然后通过某些方法来改。



### 声明式

**通过代码告诉计算机，想要的是什么，让计算机去想怎么做**

React的话 就是告诉React我想要什么样子的DOM，最后怎么出来都是交给 Render函数去渲染的。





## 变换（Transformation）
设计 React 的核心前提是任务UI只是把数据通过映射关系换成另一种形式的数据，同样的输入必会有同样的输出。跟纯函数是相同的。

```javascript
function NameBox(name) {
  return {
    fontWeight: 'bold',
    labelContent: name
  };
}
```

## 抽象 （Abstraction）
一个函数不可能实现复杂的UI，重要的是，你需要把UI抽象成多个隐藏内部细节。又可复用的函数。通过在一个函数中调用另一个函数来实现复杂的UI。
```javascript
function FancyUserBox(user) {
  return {
    borderStyle: '1px solid blue',
    childContent: [
      'Name: ',
      NameBox(user.firstName + ' ' + user.lastName)
    ]
  };
}

// 
{ firstName: 'Sebastian', lastName: 'Markbåge' } ->
{
  borderStyle: '1px solid blue',
  childContent: [
    'Name: ',
    { fontWeight: 'bold', labelContent: 'Sebastian Markbåge' }
  ]
};
```

## 组合（Composition）
将两个或者多个不同的抽象合并为一个，达到重用的特性。
```javascript
function FancyBox(children) {
  return {
    borderStyle: '1px solid blue',
    children: children
  };
}

function UserBox(user) {
  return FancyBox([
    'Name: ',
    NameBox(user.firstName + ' ' + user.lastName)
  ]);
}
```

## 状态 （State）
UI不单单是对服务器或业务逻辑的复制，实际上还有很多状态是具体的渲染目标。把可以改变的state的函数串联气啦作为原点放置在顶层。


## Memoization
对于纯函数，使用相同的参数一次调用未免太浪费资源。可以创建一个函数的memorized版本，用来追踪最后一个参数和结果。
```javascript
function memoize(fn) {
  var cachedArg;
  var cachedResult;

  return function(arg) {
    if (cachedArg === arg) {
      return cachedResult;
    }
    cachedArg = arg;
    cachedResult = fn(arg);
    return cachedResult;
  }
}

var MemoizeNameBox = memoize(NameBox);

function NameAndAgeBox(user, currentTime) {
  return FancyBox([
    'Name: ',
    MemoizedNameBox(user.firstName + ' ' + user.lastName),
    'Age in milliseconds: ',
    currentTime - user.dateOfBirth
  ]);
}
```

## 列表
大部分UI都是展示列表数据中不同的item的列表结构。 这是一个天然的层级。为了管理列表中的每一个item的state。我们可以创造一个Map容纳具体的item的state。

```javascript
function UserList(users, likesPerUser, updateUserLikes) {
  return users.map(user => FancyNameBox(
    user,
    likesPerUser.get(user.id),
    () => updateUserLikes(user.id, likesPerUser.get(user.id) + 1)
  ));
}

var likesPerUser = new Map();
function updateUserLikes(id, likeCount) {
  likesPerUser.set(id, likeCount);
  rerender();
}

UserList(data.users, likesPerUser, updateUserLikes);
```
现在我们向 FancyNameBox 传了多个不同的参数。这打破了我们的 memoization 因为我们每次只能存储一个值

## 不可变性

记录变化，如果对象可变 那么需要遍历整个对象树来比较每一个值。操作的复杂度很高，如果不可变性原则，每次返回一个新对象 只要判断这个新对象被替换了 就可以知道其中数据是改变了的

```javascript
const player = {
  score: 1,
  name: 'Jeff'
};


const newPlayer = Object.assign({}, player, { score: 2 }); 
```

> 判断何时重新渲染
如果数据发生了变化，可以很方便的判断对象数据是否发生了改变，那么可以很好决定何时根据数据的改变重新渲染组件。尤其是
纯组件 pure components 的时候。


### 函数组件

如果你的组件只包含一个render方法。没有state，那么可以写成函数组件。这样更简单。这个函数接收 props 作为参数，然后返回需要渲染的元素。函数组件写起来并不像 class 组件那么繁琐，很多组件都可以使用函数组件来写。

```javascript
// this.props 都改成props 函数记得去掉()
function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}
```

### 选择一个 key

每当一个列表重新渲染时，React 会根据每一项列表元素的 key 来检索上一次渲染时与每个 key 所匹配的列表项。如果 React 发现当前的列表有一个之前不存在的 key，那么就会创建出一个新的组件。如果 React 发现和之前对比少了一个 key，那么就会销毁之前对应的组件。如果一个组件的 key 发生了变化，这个组件会被销毁，然后使用新的 state 重新创建一份。

key 是 React 中一个特殊的保留属性（还有一个是 ref，拥有更高级的特性）。当 React 元素被创建出来的时候，React 会提取出 key 属性，然后把 key 直接存储在返回的元素上。虽然 key 看起来好像是 props 中的一个，但是你不能通过 this.props.key 来获取 key。React 会通过 key 来自动判断哪些组件需要更新。组件是不能访问到它的 key 的。

**组件的 key 值并不需要在全局都保证唯一，只需要在当前的同一级元素之前保证唯一即可。**





## React 16 架构

### Fiber （Fiber 其实就是一段虚拟DOM）

> Fiber 是React内部实现的一套 状态更新机制，支持不同任务的优先级，可中断恢复，并且恢复之后可以复用之前的中间状态，每个任务更新单元就是 React 元素对应的 Fiber节点



在`React15`及以前，`Reconciler`采用递归的方式创建虚拟DOM，递归过程是不能中断的。如果组件树的层级很深，递归会占用线程很多时间，造成卡顿。

为了解决这个问题，`React16`将**递归的无法中断的更新**重构为**异步的可中断更新**，由于曾经用于递归的**虚拟DOM**数据结构已经无法满足需要。于是，全新的`Fiber`架构应运而生。



1、作为架构来说，之前`React15`的`Reconciler`采用递归的方式执行，数据保存在递归调用栈中，所以被称为`stack Reconciler`。`React16`的`Reconciler`基于`Fiber节点`实现，被称为`Fiber Reconciler`。



2、作为静态的数据结构来说，每个`Fiber节点`对应一个`React element`，保存了该组件的类型（函数组件/类组件/原生组件...）、对应的DOM节点等信息。



3、作为动态的工作单元来说，每个`Fiber节点`保存了本次更新中该组件改变的状态、要执行的工作（需要被删除/被插入页面中/被更新...



#### Fiber节点的连接

每个Fiber节点对应一个 元素，那么多个是怎么连接形成树的。

```js
// 指向父级 Fiber 节点
this.return = null;
// 指向子Fiber节点
this.child = null
// 右边第一个兄弟Fiber节点
this.sibling = null;
```



#### 静态的数据结构

```js
// Fiber对应组件的类型 Function/Class/Host...
this.tag = tag;
// key属性
this.key = key;
// 大部分情况同type，某些情况不同，比如FunctionComponent使用React.memo包裹
this.elementType = null;
// 对于 FunctionComponent，指函数本身，对于ClassComponent，指class，对于HostComponent，指DOM节点tagName
this.type = null;
// Fiber对应的真实DOM节点
this.stateNode = null;
```



#### 动态的工作单元

```js
// 保存本次更新造成的状态改变相关信息
this.pendingProps = pendingProps;
this.memoizedProps = null;
this.updateQueue = null;
this.memoizedState = null;
this.dependencies = null;

this.mode = mode;

// 保存本次更新会造成的DOM操作
this.effectTag = NoEffect;
this.nextEffect = null;

this.firstEffect = null;
this.lastEffect = null;

// 调度优先级相关
this.lanes = NoLanes;
this.childLanes = NoLanes;
```



### 双缓存

**在内存中构建并直接替换，Fiber的构建和替换 对应着DOM树的创建与更新**

在`React`中最多会同时存在两棵`Fiber树`。当前屏幕上显示内容对应的`Fiber树`称为`current Fiber树`，正在内存中构建的`Fiber树`称为`workInProgress Fiber树`。

`current Fiber树`中的`Fiber节点`被称为`current fiber`，`workInProgress Fiber树`中的`Fiber节点`被称为`workInProgress fiber`，他们通过`alternate`属性连接。

React`应用的根节点通过`current`指针在不同`Fiber树`的`rootFiber`间切换来实现`Fiber树`的切换。当`workInProgress Fiber树`构建完成交给`Renderer`渲染在页面上后，应用根节点的`current`指针指向`workInProgress Fiber树`，此时`workInProgress Fiber树`就变为`current Fiber树`。每次状态更新都会产生新的`workInProgress Fiber树`，通过`current`与`workInProgress`的替换，完成`DOM`更新。



#### mount

* 首次执行`ReactDOM.render`会创建`fiberRootNode`（源码中叫`fiberRoot`）和`rootFiber`。其中`fiberRootNode`是整个应用的根节点，`rootFiber`是`<App/>`所在组件树的根节点。（之所以要区分`fiberRootNode`与`rootFiber`，是因为在应用中我们可以多次调用`ReactDOM.render`渲染不同的组件树，他们会拥有不同的`rootFiber`。但是整个应用的根节点只有一个，那就是`fiberRootNode`）

* `fiberRootNode`的`current`会指向当前页面上已渲染内容对应对`Fiber树`，被称为`current Fiber树`。但是 current Fiber树目前是空的，没有任何子树

  

## 深入理解JSX

我们写JSX语法的时候，必须要引入react，虽然你可能并没有用到。因为最后会被编译成 React.createElement方法来创建虚拟DOM。



















