# React好的文章

## 性能、优化你的React组件（政采云）

React基于虚拟DOM和高效Diff算法虽然实现DOM的最小粒度的更新。大多数情况下React对DOM的渲染效率足以我们的日常业务。但是复杂的业务场景下，性能问题依然会需要优化来提升运行性能，**很重要的一点就是避免不必要的渲染（render）**


### render 何时会被触发

* 组件挂载 
React组件构建并将DOM元素插入页面的过程，组件首次渲染的时候会调用 无法避免。

* setState 方法调用
setState是React中最常用的命令，通常情况下，执行setState会触发render。**执行setState的时候一定会重新渲染吗** 其实当setState传入null的时候并不会触发render。

```jsx
const Child = () => {
  console.log('child render');
  return <div>child</div>
}

class App extends React.Component {
  state = {
    a: 1
  };

  render() {
    console.log("render");
    return (
      <div>
        <p>{this.state.a}</p>
        <button onClick={() => { this.setState({ a: 101 }) }}>
          Click
        </button>
        <button onClick={() => this.setState(null)}>setState null</button>
        <Child />
      </div>
    );
  }  
}
```

### 父组件重新渲染
只要父组件重新渲染了，即使传入子组件的props为发生变化，那么子组件也会重新渲染，进而触发 render。

### shouldComponentUpdate 和 PureComponent
在React类组件中，可以利用 shouldComponentUpdate 或者 PureComponent来减少父组件更新而触发子组件的render，从而到达目的。shouldComponentUpdate来决定是否组件重新渲染，如果不希望组件重新渲染，返回false即可。



## React + TypeScript 配置


### 初始化 dotfiles

前端项目配置项有时候是比较多，但是每个文件都有自己存在的意义。**存在即合理**

#### .gitignore

初始化git仓库后第一步就是 .gitignore。这个文件会让你的 VSCOde 的版本控制不监控 node_modules 下的文件。回去忽视某些文件。

#### .editorconfig

通过配置 editorconfig，我们可以让多个开发人员，使用不同的编辑器。代码风格仍然保持一致。

本质上 editorconfig 和 prettier 的区别在于：editorconfig 是主动作用于编辑器的，你添加了 .editoronfig 文件，调用 VSCode 的格式化，格式化结果就是 .editorconfig 配置的风格。而 prettier 只是一个命令行工具，需要我们去调用它，它才会格式化代码，它本身是被动的。如果你不配置 editorconfig，那当用户修改了一个文件，调用 VSCode 快捷键手动格式化代码，提交时又被 prettier 格式化一遍，因为 VScode 内置的 formatter 和 prettier 风格不一样，导致我明明手动格式化了，怎么提交后还被修改了。配置 editorconfig ，并且使其和 prettier 的风格保持一致，就可以解决前面提到的多次格式化结果不一样的问题。事实上， react 就是这样干的。

#### nrm

nrm 是 npm的管理工具，将 npm 源设置为淘宝源。

```sh
npm i -g nrm

# 设置使用淘宝源
nrm use taobao

# 查看其它源
nrm ls
```

#### package.json

生成 package.json 文件的时候 首先要考虑到使用什么命令。

#### .travis.yml

```yml
language: node_js
cache:
  - yarn
install:
  - yarn
script:
  - yarn test

```

#### eslint
因为是打算使用 TypeScript 来编写 react，所以要选择一款支持 TypeScript 的 lint 工具，最流行的支持 TypeScript 的 ESlint。yarn add eslint -D

```sh
# 调用eslint 自带的配置生成器
npx eslint --init

# 安装依赖
yarn
# 升级到最新版本
yarn upgrade --latest
```

### lint-staged

我们每次提交代码都要对代码先进行 lint 和格式化，确保团队的代码风格统一。为了达到每次 lint 和格式化时只处理我们修改了的代码，也就是保存在 git stage 区（暂存区）的代码。为了达到在我们每次 commit 的时候，都自动 lint 和格式化，我们需要给 git commit 挂个钩子，使用 husky 可以很轻松的给 git 配置钩子。

安装 husky 和 lint-staged  **yarn add husky lint-staged -D**

```js
// package.json
{
    "husky": {
        "hooks": {
            // 在执行 git commit 调用 lint-staged 命令，lint-staged 会读取 package.json 中 lint-staged 的配置
            "pre-commit": "lint-staged"
        }
    },
}
// package.json
{
    "lint-staged": {
        // 对于 ts,tsx,js 文件调用 eslint
        "*.{ts,tsx,js}": [
            "eslint -c .eslintrc.js"
        ],
        // 对于 scss 文件调用 stylelint
        "*.scss": [
            "stylelint --config .stylelintrc.json"
        ],
        // prettier 支持很多类型文件的格式化
        "*.{ts,tsx,js,json,scss,md}": [
            "prettier --write"
        ]
    },
}
```













## 更好的设计React组件

### 组件的API

![border](https://user-gold-cdn.xitu.io/2019/3/20/1699918c020b85cb?imageView2)

* render
* state
* props
* context
* lifecycle events


虽然组件提供一份完整、方便利用的 API。一般组件划分为有状态组件和无状态组件。有状态组件通常用到 render、state以及生命周期钩子。无状态 render、props、以及context。

![border](https://user-gold-cdn.xitu.io/2019/3/20/1699922e7762a5b0?imageView2)


React里面有一些设计模式，好的设计模式 **能够清晰的拆分数据或逻辑层以及用户界面（展示层）的最佳实践** 


### 组件设计模式

* 容器组件（container）
* 展示组件（Presentational） 
* 高阶组件（Higher-Order）
* 渲染回调（Render Callbacks）



#### 容器组件

容器组件是同外部数据进行交互，然后渲染其相应的子组件。 容器组件是数据或逻辑层，能够使用生命周期钩子来链接管理状态 store，能通过 props 传递数据和 回调给相应的子组件。容器组件的 render 方法中返回的是由多个展示子组件组成的 React 元素。

```jsx
// 展示组件
const GreetingCard = (props) => {
  return (
    <div>
      <h1>{ props.name } </h1>
    </div>
  )
};

// 容器组件
class Greeting extends React.Component {
  constructor() {
    super();
    this.state = {
      name: ''
    };
  }

  componentDidMount() {
    // Ajax
    this.setState(() => {
      return {
        name: 'William'
      }
    });
  }

  render() {
    return (
      <div>
        <GreetingCard name={state.name} />
      </div>
    );
  }
}
```

### HOC 高阶组件

高阶组件就是一个函数，且改函数接受一个组件作为参数，并返回一个新的组件。

这是一种为任意组件复用某个组件逻辑而提供的强大模式。就比如react-router-v4 和 Redux。在react-router-v4中，使用withRouter()，你的组件就能通过 props 继承react-router中的一些方法。在 redux 中也是一样的，connect({})() 方法就能把 actions 和 reducer 传入组件中。


### Render Callbacks（渲染回调）

跟 HOC 类似，也是共享或复用组件逻辑的强大模式。render callbacks 能够减少命名空间的冲突以及更好地说明代码逻辑是来自哪里。