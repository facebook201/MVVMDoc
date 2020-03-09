# Guides 导航指南

## Primary Components 

There are three primary categories of components in React Router。React-Router 里面的组件主要分三类。

* routers, like BrowserRouter HashRouter
* route matchers like Route and Switch
* navigation, Link, NavLink and Redirect


### Routers 路由器


* BrowserRouter 是常规的URL路径，需要服务器匹配正确的路径
* HashRouter 是hash模式的路径


### Router Matchers 路由匹配器


Switch 和 Route，当 Switch 渲染的时候，会找子组件Route元素，查找其路径与当前URL匹配的元素，会忽视其他所有的。
所以我们应该把特定路径较长的放在较短之前。

Route path 匹配URL的开头，而不是整个开头。因此，\<Route path="/"> 始终匹配。通常放在最后，或者使用 exact 与整个URL匹配。

Link 组件是用来调转的，NavLink是一种特殊的 Link，当它的 prop 与当前位置匹配时，可以将其自身设置为 active。

## Server Rendering



### Scroll Restoration 滚动还原

滚动还原主要是使用 history.pushState 方法，


### Redux Integration Redux 整合




