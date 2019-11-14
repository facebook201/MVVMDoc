
# React的设计思想

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

### 函数
