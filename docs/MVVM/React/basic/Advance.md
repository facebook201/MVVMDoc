# React 高级部分

## JSX
JSX本质上来说只是为 React.createElement(Component, props, ...children)方法提供的语法糖。
更详细的可以看这里 [createElement](https://cn.vuejs.org/v2/guide/render-function.html#%E8%99%9A%E6%8B%9F-DOM)

```jsx
<div color="blue">
  Click Me
</div>

// 编译成
React.createElement('div', {
  color: 'blue'
}, 'Click Me');
```

### React元素类型
大写开头的JSX标签标示一个React组件，这些标签会编译为同名变量并被引用。所以引用之前要先声明Foo变量，

```jsx
import React from 'react';
import CustomButton from './CustomButton';

function WarningButton() {
  // 返回 React.createElement(CustomButton, {color: 'red'}, null);
  return <CustomButton color="red" />;
}
```

### 默认属性和扩展属性

如果没有给属性传值，默认传true。 如果你已经有了一个props对象，并且想在JSX中传递，可以使用...作为扩展运算符来传整个属性对象。
```jsx
<MyTextBox autocomplete />

function App2() {
  const props = {firstName: 'Ben', lastName: 'Hector'};
  return <Greeting {...props} />;
}
```

## PropTypes 类型检查
React 内置了一些类型检查的功能，在组件的props上进行类型检查。只要配置 propTypes 属性:

```javascript
import PropTypes from 'prop-types';

class Greeting extends React.Component {
  render() {
    return (
      <h1> Hello，{this.props.name}</h1>
    );
  }
};

Greeting.propTypes = {
  name: PropTypes.string
};
```

```jsx
import PropTypes from 'prop-types';

MyComponent.propTypes = {
  // 你可以将属性声明为以下 JS 原生类型
  optionalArray: PropTypes.array,
  optionalBool: PropTypes.bool,
  optionalFunc: PropTypes.func,
  optionalNumber: PropTypes.number,
  optionalObject: PropTypes.object,
  optionalString: PropTypes.string,
  optionalSymbol: PropTypes.symbol,

  // 任何可被渲染的元素（包括数字、字符串、子元素或数组）。
  optionalNode: PropTypes.node,

  // 一个 React 元素
  optionalElement: PropTypes.element,

  // 你也可以声明属性为某个类的实例，这里使用 JS 的
  // instanceof 操作符实现。
  optionalMessage: PropTypes.instanceOf(Message),

  // 你也可以限制你的属性值是某个特定值之一
  optionalEnum: PropTypes.oneOf(['News', 'Photos']),

  // 限制它为列举类型之一的对象
  optionalUnion: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Message)
  ]),

  // 一个指定元素类型的数组
  optionalArrayOf: PropTypes.arrayOf(PropTypes.number),

  // 一个指定类型的对象
  optionalObjectOf: PropTypes.objectOf(PropTypes.number),

  // 一个指定属性及其类型的对象
  optionalObjectWithShape: PropTypes.shape({
    color: PropTypes.string,
    fontSize: PropTypes.number
  }),

  // 你也可以在任何 PropTypes 属性后面加上 `isRequired` 
  // 后缀，这样如果这个属性父组件没有提供时，会打印警告信息
  requiredFunc: PropTypes.func.isRequired,

  // 任意类型的数据
  requiredAny: PropTypes.any.isRequired,

  // 你也可以指定一个自定义验证器。它应该在验证失败时返回
  // 一个 Error 对象而不是 `console.warn` 或抛出异常。
  // 不过在 `oneOfType` 中它不起作用。
  customProp: function(props, propName, componentName) {
    if (!/matchme/.test(props[propName])) {
      return new Error(
        'Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      );
    }
  },

  // 不过你可以提供一个自定义的 `arrayOf` 或 `objectOf` 
  // 验证器，它应该在验证失败时返回一个 Error 对象。 它被用
  // 于验证数组或对象的每个值。验证器前两个参数的第一个是数组
  // 或对象本身，第二个是它们对应的键。
  customArrayProp: PropTypes.arrayOf(function(propValue, key, componentName, location, propFullName) {
    if (!/matchme/.test(propValue[key])) {
      return new Error(
        'Invalid prop `' + propFullName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      );
    }
  })
};
```

## Refs & DOM

在React数据流中，以props来渲染子组件。但是某些情况下需要在典型数据流外强制修改子组件。要修改的子组件可以是React组件的实例。


### 何时使用 Refs

* 处理焦点、文本选择或媒体控制
* 触发强制动画
* 继承第三方DOM库

### 创建和访问 refs

使用 React.createRef() 创建refs，通过ref属性来获得 React元素，当构造组件时，refs通常被赋值给实例的一个属性。
当一个ref属性被传递给一个render函数中的元素时，可以使用ref中的current属性对节点的引用进行访问。

```jsx
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  render() {
    return <div ref={this.myRef} />;
  }
}

const node = this.myRef.current;
```
ref的值取决于节点的类型:

* 当 ref 属性被用于一个普通的 HTML 元素时，React.createRef() 将接收底层 DOM 元素作为它的 current 属性以创建 ref 。
* 当 ref 属性被用于一个自定义类组件时，ref 对象将接收该组件已挂载的实例作为它的 current 。
* 你不能在函数式组件上使用 ref 属性，因为它们没有实例。

### refs和函数式组件

不能在函数式组件上使用组件，因为函数组件没有实例。不过可以在函数内部使用，只要它指向一个DOM元素或者class组件。


### string的ref

定义ref为字符串的时候，需要React追踪当前正在渲染的组件，在reconciliation（协调）阶段，React Element 创建和更新的过程中，ref会被封装成一个闭包函数，ref会被封装成一个闭包函数，等待 commit 阶段被执行，这对性能有一些影响。

## Refs 转发
refs 转发是一项将ref自动地通过组件传递到其一子组件的技巧，对于大多数应用中的组件来说，这通常不是必需的。
但其对某些组件，尤其是可重用的组件库是很有用的。

#### 转发refs到DOM组件



## 性能优化

React本身内部就用来巧妙的技术来最小化DOM操作，但是此外还有一些优化React应用性能的办法。


### 避免重复渲染

当组件的props或者state改变时，组件会比较返回的元素和之前渲染的元素来决定是否有必要更新实际的DOM。不相等就会更新DOM，不如你知道不更新 就可以返回false 来跳过更新渲染过程，该进程包括了对该组件和之后的内容调用render()指令。



## Context


## 错误边界
错误边界是为了防止JavaScript 错误导致应用崩溃，引入的一个新的概念。它是一种React组件，这种组件**可以捕获并打印发生在其子组件树任何位置的错误，并且会渲染出备用UI**，而不是渲染那些崩溃了的子组件树。错误边界在渲染期间、生命周期方法和整个组件树的构造函数中捕获错误。

:::warning 错误变量无法捕获以下场景中的错误
* 事件处理
* 异步代码（setTimeout、requestAnimationFrame的回调函数）
* 服务端渲染
* 自身抛出来的错误（并非它的子组件）
:::



## 高阶组件
高阶组件（HOC）是React中复用组件逻辑的一种高级技巧。HOC自身不是React API的一部分，它是一种基于React的组合特性而形成的设计模式。

**高阶组件是参数为组件，返回值是新组件的函数。** 简单说 高阶组件就是一个函数。
```jsx
const EnhancedComponent = higherOrderComponent(WrappedComponent);
```
组件是将 props 转换为 UI，而高阶组件是将组件转换为另一个组件。

在大型应用中，我们需要把公共和可复用的逻辑抽象成一个组件，在多个组件之间共享。可以编写一个函数，接受一个子组件作为第一个参数，其他的参数用来辅助完成这个函数。

```jsx
// 官网例子

// 这样使用 withSubscription 高阶组件函数 传一个组件 返回一个新的组件
const CommentListWithSubscription = withSubscription(CommentList, (DataSource) => DataSource.getComments());

const BlogPostWithSubscription = withSubscription(BlogPost, (DataSource, props) => DataSource.getBlogPost(props.id));


// 此函数接收一个组件... 
function withSubscription(WrappedComponent, selectData) {
  // ...并返回另一个组件...
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.state = {
        data: selectData(DataSource, props)
      };
    }

    componentDidMount() {
      // ...负责订阅相关的操作...
      DataSource.addChangeListener(this.handleChange);
    }

    componentWillUnmount() {
      DataSource.removeChangeListener(this.handleChange);
    }

    handleChange() {
      this.setState({
        data: selectData(DataSource, this.props)
      });
    }

    render() {
      // ... 并使用新数据渲染被包装的组件!
      // 请注意，我们可能还会传递其他属性
      return <WrappedComponent data={this.state.data} {...this.props} />;
    }
  };
}
```

**HOC不会修改传入的组件，也不会使用继承来复制其行为。相反，HOC通过将组件包装在容器组件中来组成新组件。HOC是纯函数，没有副作用。被包装组件接收来自容器组件的所有prop，同时也接收一个新的用于render的data prop。**


### 将不相关的props传递给包裹的组件
HOC应该透传与自身无关的Props。大多数HOC都应该包含一个类似于下面的render方法。

```jsx
render() {
  // 过滤掉非此 HOC 额外的 props，且不要进行透传
  const { extraProp, ...otherProps } = this.props;
  // 将 props 注入到被包装的组件中
  // 通常为 state 的值或者实例方法
  const injectedProp = someStateOrInstanceMethod;

  // 将props传递给包装组件
  return (
    <WrappedComponent
      injectedProp={injectedProp}
      {...otherProps} />
  )
}
```

### 注意事项


#### 不要在render方法中使用 HOC
React的 diff算法（称为协调）使用组件标识来确定它是应该跟新现有子树还是将其丢弃并挂载新子树，如果congrender返回的组件与前一个渲染中的组件相同，
则react 通过将子树与新子树进行区分来递归更新子树。如果不相等 则完全卸载前一个子树。

```jsx
render() {
  // 每次调用render函数 都会创建一个新的 EnhancedComponent
  // EnhancedComponent1 !== EnhancedComponent2
  const EnhancedComponent = enhance(MyComponent);

  // 这将导致子树每次渲染都会进行卸载 和重新挂载的操作
  return <EnhancedComponent />;
}
```
重新挂载组件会导致该组件及其所有子组件的状态丢失。

#### 复制静态方法

有时在React组件上定义静态方法很有用。例如 Relay容器暴露了一个静态方法 getFragment 以方面组合 GraphQL片段。但是 当你将 HOC 应用于组件时，原始组件将使用容器组件进行包装。这意味着新组件没有原始组件的任何静态方法。




