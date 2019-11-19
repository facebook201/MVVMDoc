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

### 如果两种setState的用法混淆使用


```javascript
function increment(state, props) {
  return { count: state.count + 1 };
}

function incrementMultiple() {
  this.setState(increment);
  this.setState(increment);
  this.setState({count: this.state.count + 1});
  this.setState(increment);
}
```

上面这样写前面两个是直接传函数参数，第二种。第三个是直接传一个对象。结果发现 传统式setState的存在，会把函数式setState积攒的效果清空。
只要有一个传统式的setState调用，就把其他函数式setState调用给害了。


## 事件处理

React元素的事件处理和DOM元素的很相似。

* React事件绑定命名采用驼峰写法
* React阻止默认行为不能使用false方式，要明确使用 preventDefault()


```javascript
// e是一个合成事件 不需要担心兼容性问题
function handleClick(e) {
  e.preventDefault();
}
```

JSX回调函数中的this，类的方法默认是不会绑定this。有两种方案来解决这个问题 ，
一个是在初始化器里面使用bind，一个是使用箭头函数

```jsx
constructor(props) {
  super(props);
  
  this.handleClick = this.handleClick.bind(this);
}

handleClick() {
  // ...
}

// 1 
<button onClick={this.handleClick}></button>

// 2
<button onClick={(e) => this.handleClick(e)}></button>

// 函数组件 如果是一个函数组件 props不需要带上括号
<button onClick={() => props.handleClick}></button>
```

### 事件添加参数

参数e作为React事件对象将会被作为第二个参数进行传递。 **箭头函数的事件对象必须显式进行传递，如果bind的方式 事件对象以及更多的参数将会被隐式传递**

```jsx
<button onClick={(e) => this.deleteRow(id, e)}>Delete Row</button>
<button onClick={this.deleteRow.bind(this, id)}>Delete Row</button>
```

**通过bind方式向监听函数传参，类组件中定义的监听函数，事件对象e要排在梭传递参数的后面。**

```jsx
class Popper extends React.Component{
  constructor(){
    super();
    this.state = {name:'Hello world!'};
  }
   
  preventPop(name, e){    //事件对象e要放在最后
    e.preventDefault();
  }
    
  render(){
    return (
      <div>
        <p>hello</p>
        {/* Pass params via bind() method. */}
        <a href="https://reactjs.org" onClick={this.preventPop.bind(this,this.state.name)}>
          Click
        </a>
      </div>
    );
  }
}
```

###  阻止组件渲染

极少数情况下，你可能希望隐藏组件，即使它被其他组件渲染，让render方法返回null，而不是它的渲染结果即可实现。
```jsx
function WarningBanner(props) {
  if (!props.warn) {
    return null;
  }
  return (
    <div className="warning">
      Warning!
    </div>
  );
}

class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showWarning: true}
    this.handleToggleClick = this.handleToggleClick.bind(this);
  }

  handleToggleClick(e) {
    console.log(e);
    this.setState(prevState => ({
      showWarning: !prevState.showWarning
    }));
  }

  render() {
    return (
      <div>
        <WarningBanner warn={this.state.showWarning} />
        <button onClick={this.handleToggleClick}>
          {this.state.showWarning ? 'Hide' : 'Show'}
        </button>
      </div>
    );
  }
}
```

## 列表和keys

使用map函数来渲染多个组件。同时要给数组的每个元素赋予一个确定的标识，就是key。一般使用唯一的id来当做这个key，不建议使用索引当这个index。

### 用keys提取组件

元素的key只有在它和它的兄弟节点对比时才有意义。应该尽量提取出一个ListItem组件，把key保存在数组中的这个组件元素上。而不是放在ListItem组件中的 li 元素上。

```jsx
// 错误示例
function ListItem(props) {
  const value = props.value;
  return (
    // 错啦！你不需要在这里指定key:
    <li key={value.toString()}>
      {value}
    </li>
  );
}

// 正确示例
function ListItem(props) {
  // 对啦！这里不需要指定key:
  return <li>{props.value}</li>;
}

function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map((number) =>
    // 对啦！key应该在数组的上下文中被指定
    <ListItem key={number.toString()}
              value={number} />

  );
  return (
    <ul>
      {listItems}
    </ul>
  );
}

const numbers = [1, 2, 3, 4, 5];
ReactDOM.render(
  <NumberList numbers={numbers} />,
  document.getElementById('root')
);
```

### jsx中嵌入 map
```jsx
// 可以这样写
function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map((number) => <ListItem key={number.toString()} value={number} />);
  return (
    <ul>
      {listItems}
    </ul>
  );
}

// 也可以这样写
function NumberList(props) {
  const numbers = props.numbers;
  return (
    <ul>
      {
        numbers.map((number) => <ListItem key={number.toString()} value={number} />)
      }
    </ul>
  );
}
```
怎么实现取决于你自己，但是如果嵌套太多的话，就到了需要提取出组件的时机了。

## 受控组件和非受控组件

:::tip 受控组件和非受控组件
input的value值必须是我们设置在constructor构造函数的state中的值，然后通过onChange触发事件来改变state中保存的value值，这样形成一个循环的回路影响，
React负责渲染表单的组件仍然控制用户后续输入时所发生的变化。 这种称之为受控组件。

非受控也就意味着我可以不需要设置它的state属性，而通过ref来操作真实的DOM。
:::

### 受控组件

* 表单的状态发生变化 会被写入到组件的state中
* 受控组件渲染出的状态与它的value或checked prop相对应
* react受控组件更新 state 的流程
  * 通过在初始state中设置表单的默认值
  * 每当表单的值发生变化时，调用onChange事件处理器
  * 事件处理器通过合成对象e拿到改变后的状态 更新应用的state
  * setState触发视图的重新渲染 完成表单组件之的更新

* 使用受控组件需要为每一个组件绑定一个change事件 定义事件处理器来同步表单之和组件的状态
  * 文本框 => event.target.value
  * 多选框 => event.target.checked
  * 文本域 => event.target.value
  * 下拉框 => event.target.value


```javascript
class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({
      value: event.target.value
    });
  }

  render() {
    return (
      <form>
        <label>
          Name：
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
```

### 多个输入的解决方法
当有多个受控的input元素时，你可以通过给每个元素添加一个name属性，来让处理函数数据 event.target.name 值来选择做什么。
可以见 React官网 表单一章

### 非受控
像file input标签 的value属性是只读的。所以它是React中的一个非受控组件。让表单数据由DOM处理，替代方案为使用非受控

* 一个表单组件没有value prop就可以称为 非受控组件
* 非受控组件是一种反模式，它的值不受组件自身的state或props控制
* 通常需要为其添加 ref prop来访问渲染后的底层DOM元素
* 可以通过添加defaultValue指定value值




## 组合和继承
React 具有强大的组合模型，建议使用组合而不是继承来复用组件之间的代码。

### 包含关系
一些组件不能提前知道子组件是什么，这对于Sidebar 和 Dialog 这类容器组件很常见。这样可以使用children属性将子元素直接传递到输出。
这样还可以嵌套JSX来传递子组件。（有点像Vue的插槽）

官网有一个例子 FancyBorder 组件里面有一个 props.children。FancyBorder JSX标签内的任何内容都将通过children属性传入。
有时候如果需要在组件中有多个入口，这种情况下你可以使用自己约定的属性，而不是children。可以好好的敲一下官网的例子来熟悉组合



```jsx
function SplitPane(props) {
  return (
    <div className="splitpane">
      <div className="split-left">
        { props.left }
      </div>
      <div className="splitpane-right">
        { props.right }
      </div>
    </div>
  );
}

<SplitPane left={<Contacts />} right={<Chat />} />
```



