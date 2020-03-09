
# API

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



