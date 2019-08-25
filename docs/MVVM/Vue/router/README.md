<!--
 * @Author: shiyao
 * @Description: 
 * @Date: 2019-08-20 14:44:17
 -->
# 前端路由

## 前端路由
传统的路由是 URL的分层解析，最早是后端提出来的，根据不同的URL映射不同的页面。传统的服务器路由，根据客户端请求的不同网址，返回不同的网页内容 这种会造成服务器压力。所以前端路由出现，在URL地址改变的过程中，通过js来实现不同UI之间的切换。不用再向服务器发送请求，只通过ajax向服务端请求数据。根据URL的变化展示不同的UI。就是通过前端路由来实现的。


## HashChange
hash 就是指 url 后的 # 号以及后面的字符, 由于 hash 值的变化不会导致浏览器像服务器发送请求，而且 hash 的改变会触发 hashchange 事件，浏览器的前进后退也能对其进行控制。

```javascript
// 初始化一个对象 存好url对应的回调函数
  function Router() {
    this.routers = {};
    this.currentUrl = '/';
    this.init();
  }
  // 监听hasChange变化 然后做出一些改变
  Router.prototype.init = function() {
    window.addEventListener('hashchange', this.reloadPage.bind(this));
  };
  // 加载页面操作
  Router.prototype.reloadPage = function() {
    this.currentUrl = location.hash.slice(1) || '/';
    this.routers[this.currentUrl]();
  };
  // 注册路由
  Router.prototype.route = function(url, callback) {
    this.currentUrl = url;
    this.routers[this.currentUrl] = callback;
  }
  // 使用
  let router = new Router();
  let routeBox = document.getElementById('router');
  function changeContent(txt) {
    routeBox.innerHTML = txt;
  }

  router.route('/', () => {
    changeContent('当前页面是首页');
  });
  router.route('A', () => {
    changeContent('当前页面是A');
  });
```


## History

```
history.pushState();         // 添加新的状态到历史状态栈
history.replaceState();      // 用新的状态代替当前状态
history.state                // 返回当前状态对象
```

### pushState 方法
该方法需要三个参数：
1、要传递的数据 （参数）
2、给页面设置的标题 （兼容性差）
3、url

* 状态对象 ——— 状态对象state是一个JavaScript对象，通过pushState() 创建新的历史记录条目。无论什么时候用户导航到新的状态，popstate时间就会被触发。且该事件的state属性包含该历史记录条目状态对象的副本。

* URL 新的URL记录，调用方法之后浏览器不会立即加载这个URL，但可能会在稍后某些强开下加载这个URL，比如在用户重新打开浏览器时。新URL不必须为绝对路径。如果新URL是相对路径 那么它将被作为相对于当前URL处理。新URL必须与当前URL同源，否则pushState（）会抛出一个异常。

* history.pushState() 在保留现有历史记录的同时，将 url 加入到历史记录中。
* history.replaceState() 会将历史记录中的当前页面历史替换为 url。

```javascript
history.pushState({ id: 1 }, 'title', url);
```
pushState 不会触发 popstate事件。 只有在前进后退的时候 才会触发，所以pushState之后。需要手动去设置页面的相关状态。

### replaceState 
跟 pushState 一样，区别是修改浏览历史中当前记录 而非添加记录，同样不触发跳转。
### popstate 事件。
当同一个文档的history对象出现变化，就会触发popstate事件。**仅仅调用 pushState和replaceState方法，不会触发该事件，只有用户点击浏览器倒退按钮和前进按钮，或者调用 back、forward、go方法才会触发。**

由于 history.pushState() 和 history.replaceState() 可以改变 url 同时，不会刷新页面，所以在 HTML5 中的 histroy 具备了实现前端路由的能力。回想我们之前完成的 hash 模式，当 hash 变化时，可以通过 hashchange 进行监听。
而 history 的改变并不会触发任何事件，所以我们无法直接监听 history 的改变而做出相应的改变。
