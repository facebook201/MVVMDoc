
# React-Router

## 安装
React-Router 现在被划分为三个包：react-router、react-router-dom、react-router-native。
**不应该直接安装react-router，这个包为React Router应用提供核心的路由组件和函数，另外两个包提供了特定环境的组件（浏览器和react-native对应的平台）** 如果在浏览器中构建一个网站，使用react-router-dom。


## 首先对比V3 和 V4
```javascript
import { Router, Route, IndexRoute } from 'react-router';

const PrimaryLayout = props => (
  <div className="primary-layout">
    <header>
      Our React Router 3 App
    </header>
    <main>
      { props.children }
    </main>
  </div>
);

const HomePage = () => <div>Home Page</div>;
const UserPage = () => <div>Users Page</div>;

const App = () => (
  <Router history={browserHistory}>
    <Route path="/" component={PrimaryLayout}>
      <IndexRoute component={HomePage} />
      <Route path="/users" component={UserPage} />
    </Route>
  </Router>
);

render(<App />, document.getElementById('root'));
```
上面是V3版本的写法，只有两个路由，首页和用户页面。相比V4的改变，在V4是不正确的：

* 路由集中在一个地方
* 布局和页面嵌套是通过 Route 组件的嵌套而来的
* 布局和页面组件是完全纯粹的 他们是路由的一部分

**React Router4 不再主张集中式路由，相反路由规则位于布局和UI本身之间。**
```javascript
import { BrowserRouter, Route } from 'react-router-dom';

const PrimaryLayout = () => (
  <div className="primary-layout">
    <header>
      Our React Router 4 App
    </header>

    <main>
      <Route path="/" exact component={HomePage} />
      <Route path="/users" exact component={UsersPage} />
    </main>
  </div>
);

const HomePage = () => <div>Home Page</div>;
const UserPage = () => <div>Users Page</div>;

const APP = () => (
  <BrowserRouter>
    <PrimaryLayout />
  </BrowserRouter>
);

render(<App />, document.getElementById('root'));
```

* 在V3中有 props.children来嵌套组件，在V4中 Route 组件在何处编写，如果路由匹配 子组件将在那里渲染。

### 包容性路由
在V3中路由规则是 "排他性的"，意味着只有一条路由获胜，V4的路由默认为"包含的"，多个Route可以同时匹配和渲染。
如果没有 exact属性，浏览器访问 /users 时候 HomePage 和 UsersPage组件都会被渲染。**exact属性是准备的匹配，/one 无法匹配 /one/two **

### 排他性路由
如果只要在路由列表匹配一个路由，则使用 Switch 来启用。
```javascript
const PrimaryLayout = () => (
  <div className="primary-layout">
    <main>
      <Switch>
        <Route path="/" exact component={HomePage} />
        <Route path="/users/add" exact component={UsersAddPage} />
        <Route path="/users" exact component={UsersPage} />
        <Redirect to="/" />
      </Switch>
    </main>
  </div>
);
```
**在Switch路由中只有一条会被渲染，在**

### 路由匹配原理之路径语法
路由路径是匹配一个URL的一个字符串模式，大部分的路由路径都可以直接按照字面量理解。在/users 之前策略性地放置了 /users/add 的路由
保证正确匹配。/users/add 会匹配 /users 和 /users/add，所以把放在/users/add 放在前面。 

* ：paramName 匹配一段位于 / ? # 之后的URL 命中的部分将被作为一个参数 一个路径参数使用冒号：标记
* () 在它内部的内容被认为是可选的
* - 匹配任意字符（非贪婪的）直到命中下一个字符或者整个 URL 的末尾，并创建一个 splat 参数

```javascript
<Route path="/hello/:name">         // 匹配 /hello/michael 和 /hello/ryan
<Route path="/hello(/:name)">       // 匹配 /hello, /hello/michael 和 /hello/ryan
<Route path="/files/*.*">           // 匹配 /files/hello.jpg 和 /files/path/to/hello.jpg
```

## 嵌套布局
假设要扩展用户部分，会有一个用户列表和用户详情。
第一种方法，修改 PrimaryLayout, 适应用户和产品对应的列表和详情
```javascript
const PrimaryLayout = props => {
  return (
    <div className="primary-layout">
      <PrimaryHeader />
      <main>
        <Switch>
          <Route path="/" exact component={HomePage} />
          <Route path="/users" exact component={BrowseUsersPage} />
          <Route path="/users/:userId" component={UserProfilePage} />
          <Route path="/products" exact component={BrowseProductsPage} />
          <Route path="/products/:productId" component={ProductProfilePage} />
          <Redirect to="/" />
        </Switch>
      </main>
    </div>
  )
}
```
BrowseUsersPage 和 UserProfilePage这两个组件都会有公用的部分。

```javascript
const BrowseUsersPage = () => (
  <div className="user-sub-layout">
    <aside>
      <UserNav />
    </aside>
    <div className="primary-content">
      <BrowseUserTable />
    </div>
  </div>
)

const UserProfilePage = props => (
  <div className="user-sub-layout">
    <aside>
      <UserNav />
    </aside>
    <div className="primary-content">
      <UserProfile userId={props.match.params.userId} />
    </div>
  </div>
)
```
每次 BrowseUsersPage 或 UserProfilePage 被渲染时，它将创建一个新的 UserNav 实例，这意味着所有的生命周期方法都将重新开始。如果导航标签需要初始网络流量，这将导致不必要的请求 —— 这都是我们决定使用路由的方式造成的

第二种方法。
```javascript
const PrimaryLayout = props => {
  return (
    <div className="primary-layout">
      <PrimaryHeader />
      <main>
        <Switch>
          <Route path="/" exact component={HomePage} />
          <Route path="/users" component={UserSubLayout} />
          <Route path="/products" component={ProductSubLayout} />
          <Redirect to="/" />
        </Switch>
      </main>
    </div>
  )
}
```
每个用户和产品页面相对应的四条路由不同，我们为每个部分的布局提供了两条路由, 上述示例没有使用 exact 属性，因为我们希望 /users 匹配任何以 /users 开头的路由，同样适用于产品。
```javascript
// UserSubLayout
const UserSubLayout = () => (
  <div className="user-sub-layout">
    <aside>
      <UserNav />
    </aside>
    <div className="primary-content">
      <Switch>
        <Route path="/users" exact component={BrowseUsersPage} />
        <Route path="/users/:userId" component={UserProfilePage} />
      </Switch>
    </div>
  </div>
)
```

新策略中最明显的胜出在于所有用户页面之间的不重复布局。这是一个双赢，因为它不会像第一个示例那样具有相同生命周期的问题。
有一点需要注意的是，即使我们在布局结构中深入嵌套，路由仍然需要识别它们的完整路径才能匹配。为了节省重复输入（以防你决定将“用户”改为其他内容），请改用 props.match.path。

```javascript
const UserSubLayout = ({ match }) => (
  <div className="user-sub-layout">
    <aside>
      <UserNav />
    </aside>
    <div className="primary-content">
      <Switch>
        <Route path={match.path} exact component={BrowseUsersPage} />
        <Route path={`${match.path}/:userId`} component={UserProfilePage} />
      </Switch>
    </div>
  </div>
)
```

### 匹配
match.path 和 match.url两个是有什么区别呢，一般来说match.url是浏览器URL中的实际路径，而path是为路由编写的路径。

* path 用于匹配路径模式。用于嵌套的Route
* url URL匹配的部分， 用于构建嵌套的 Link

## Router
react-router-dom 提供了 <BrowserRouter 和 <HashRouter组件，BrowserRouter 应该用在服务器处理动态请求的项目，HashRouter 用来处理静态页面（只能响应请求已知文件的请求）。通常来说推荐使用BrowserRouter。

## History 
每个router 都会创建一个history对象，用来保持当前位置的追踪还有在页面发生变化的时候重新渲染页面，React Router提供的其他组件依赖在
context上存储的history对象。所以他们必须在router对象的内部渲染。一个没有router祖先元素的react-router对象无法正常工作。


### 渲染一个 Router
Router 的组件只能接受一个子元素，创建了一个App组件来渲染其他的应用非常方便（将应用从router中分离对服务器渲染也有重要意义，因为我们在服务器端转换到 MemoryRouter 时可以很快复用 App）。
```javascript
import { BowserRouter } from 'react-router-dom';

ReactDOM.render((
  <BowserRouter>
    <APP />
  </BowserRouter>
), document.getElementById('root'));
```


## 官方文档实例 V5

### 嵌套路由

```tsx
// 一级路由

function NestingRouter() {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/topics">Topics</Link>
          </li>
        </ul>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/topics">
            <Topics />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

// 内层嵌套路由
function Topics() {
  // The `path` lets us build <Route> paths that are
  // relative to the parent route, while the `url` lets
  // us build relative links.
  let { path, url } = useRouteMatch();
  return (
    <div>
      <h2>Topics</h2>
      <ul>
        <li>
          <Link to={`${url}/rendering`}>Rendering with React</Link>
        </li>
        <li>
          <Link to={`${url}/components`}>Components</Link>
        </li>
        <li>
          <Link to={`${url}/props-v-state`}>Props v. State</Link>
        </li>
      </ul>

      <Switch>
        <Route exact path={path}>
          <h3>Please select a topic.</h3>
        </Route>
        <Route path={`${path}/:topicId`}>
          <Topic />
        </Route>
      </Switch>
    </div>
  );
}
```

### 重定向 Redirect组件

有时候匹配一个路径，但可能这个路径 更希望指向一个新的展示页面，而不是原本路径匹配界面，比如404。

```tsx
// Redirect组件必须属性是 to 属性 表示重定向的新地址

<Route path="/somepage" render={() => <Redirect to="/404">} />
```

### costom link 自定义链接

自定义link一般是用来实现切换路由，

* 1、导入相关模块，最后导入 useRouteMatch 判断路由是否激活
* 2、创建函数式组件 创建自定义的 Link组件，useRouteMatch 监测当前路由是否激活。
* 3、自定义使用，路由设定规则还是一样的

```tsx
// 导入自定义
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
  Redirect,
  useRouteMatch
} from 'react-router-dom';


type CostomParams = {
  to: string,
  activeOnlyWhenExact: boolean,
  label?: string
};

// 第二步定义自定义Link
function CostomLink({ to, activeOnlyWhenExact, label }: CostomParams) {
  let match = useRouteMatch({
    path: to,
    exact: activeOnlyWhenExact
  });

  return (
    <div className={ match ? 'active' : ''}>
      { match && '>' }
      <Link to={to}>{ label }</Link>
    </div>
  );
}

export default function MyRouter() {
  return (
    <div>
      <Router>
        <Link to="/foodList"> 美食列表 </Link>
        <Link to="/newList"> 新闻列表 </Link>
        <CostomLink to="/MyComponet" label="关于我们" activeOnlyWhenExact />

        <Switch>
          <Route path="/foodList" component={FoodList} />
          <Route path="/newsList" component={NewsList} />  
          <Route path="/myComponent" component={MyComponent} />

          <Redirect exact from="/" to="/newsList" />
          <Route path="foodDetail" component={FoodDetail} />
          <Route component={NotFound}></Route>
        </Switch>
      </Router>
    </div>
  );
}
```




