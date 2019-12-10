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



