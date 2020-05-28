
# API

**React-Router的原理** 顶层Router订阅history，history变化时，Router调用setState将location向下传递，并设置到RouterContext。Route组件匹配context中的location决定是否显示。Switch选择最先匹配到的显示，利用props children。Link组件阻止a标签默认事件，并调用history.push。NavLink通过匹配context中的location决定是否为active状态。Redirect组件匹配context里的location决定是否调用history.push(to)，Switch组件会匹配location和from决定是否发起Redirect。

## HOOKS

### useParams

useParams 钩子函数能够获取路由中的参数，返回一个键值对。

```tsx
import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams
} from "react-router-dom";


function BlogPost() {
  // 这里通过 useParams 获取路由参数的对象 然后结构得到其值
  let { slug } = useParams();
  return <div>Now showing post { slug } </div>
}

ReactDOM.render(
  <Router>
    <Switch>
      <Route exact path="/">
        <HomePage />
      <Route>

      <Route path="/blog/:slug">
        <BlogPost />
      </Route>
    </Switch>
  </Router>
);
```

### useHistory

useHistory 钩子可以访问用于导航的历史记录实例。

```tsx
import { useHistory } from "react-router-dom";

function HomeButton() {
  let history = useHistory();

  function handleClick() {
    history.push('/home');
  }

  return (
    <button type="type" onClick={handleClick}>
      Go Home
    </button>
  );
}
```




## Route
Route 是用于声明路由映射到应用程序的组件层。Route 有三种渲染的方法，当然，都配置的话只有一个会生效，优先级是 children > component > render。Route 组件是 React-Router最重要的组件之一，最基本的功能是渲染 路径匹配的当前的URL。看看下面的几种方法的使用和区别。三个方法都传相同的三个 route props，**match、location、history**

* Route component
* Route render
* Route children **function**


### Component

仅仅在位置匹配的时候才被渲染，且伴随着 component Props一起渲染。当你使用 component 代替render或 children子组件的时候，router使用的 React.createElement 来创建 React元素，意味着你通过component Prop 提供一个内联函数，每次渲染都会创建一个新的组件。

```jsx
ReactDOM.render(
  <Router>
    <Route path="/user/:username" component={User} />
  </Router>,
  node
);
```

### render: func

这种做法可以方便的渲染和包装，而不需要多次卸载和安装。当位置匹配时你可以使用一个回调函数。**component 优先于 render prop，所以不能同时使用。**

```jsx

// 简单的内联render
<Router>
  <Route path="/home" render={() => <div>Home</div>}> />
</Router>


包装/组合
function FadingRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={routeProps => (
        <FadeIn>
          <Component {...routeProps} />
        </FadeIn>
      )}
    />
  );
}

ReactDOM.render(
  <Router>
    <FadingRoute path="/cool" component={Something} />
  </Router>,
  node
);
```

### children：func

children 的优先级是高于 component，而且可以是一个组件，也可以是一个函数，children 没有获得 router 的 props。children 有一个非常特殊的地方在于，当路由不匹配且 children 是一个函数的时候，会执行 children 方法，这就给了设计很大的灵活性。

### exact & strict & sensitive

这三者都是使用 path-to-regexp 做路径匹配需要的三个参数。

1、exact: 如果为 true，则只有在路径完全匹配 location.pathname 时才匹配。
2、strict: 在确定为位置是否与当前 URL 匹配时，将考虑位置 pathname 后的斜线。
3、sensitive: 如果路径区分大小写，则为 true ，则匹配。


### Location

Route 元素尝试其匹配 path 到当前浏览器 URL，但是，也可以通过 location 实现与当前浏览器位置以外的位置相匹配。


## Router

Router是所有router组件的底层通用接口，一般使用下面其中一种。(alongside 在旁边)

* BrowserRouter
* HashRouter
* MemoryRouter
* NativeRouter
* StaticRouter
