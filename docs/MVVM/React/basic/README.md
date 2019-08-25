
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

