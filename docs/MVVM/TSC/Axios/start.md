# Axios 需求分析

## Features

* 在浏览器端使用 XMLHttpRequest对象通讯
* 支持 Promise API
* 支持请求和响应的拦截器
* 支持请求的取消
* JSON数据的自动装换
* 客户端防止 XSRF

## TypeScript library

这是一个

## 处理请求 url 参数

```typescript
axios({
  method: 'get',
  url: '/example/get',
  params: {
    name: 'zhangsan',
    age: 24
  }
});
```
最终结果是 '/example/get?name=zhangsan&age=24'。实际上就是把飘然模式对象的key和val    ue拼接到 url 上。


### 请求参数是数组
```typescript
axios({
  method: 'get',
  url: '/example/get',
  params: {
    foo: ['baz', 'bar']
  }
});
```
最终结果是 '/example/get?foo[]=bar&foo[]=baz'


### 请求参数值是对象
```typescript
axios({
  method: 'get',
  url: '/example/get',
  params: {
    foo: {
      bar: 'baz'
    }
  }
});
```

最终请求会将参数里面的对象encode之后拼接到foo后。'/example/get?foo=%7B%22baz...'

### 参数Date类型
```typescript
const date = new Date();

axios({
  method: 'get',
  url: '/example/get',
  params: {
    date
  }
});
```

### 空值的忽略 null、undefined

### 丢弃hash的标志


## 处理headers

```js
// formdata 浏览器自动设置 Content-Type
if (isFormData(data)) {
  delete headers['Content-Type'];
}

// 设置headers
Object.keys(headers).forEach(name => {
  // 当data为null 移除 content-type
  if (data === null && name.toLowerCase() === 'content-type') {
    delete headers[name];
  } else {
    request.setRequestHeader(name, headers[name]);
  }
});

// 格式化 Content-Type
function normalizeHeaderName(headers: any, normalizeName: string): void {
  // 如果没传就返回
  if (!headers) {
    return;
  }
  Object.keys(headers).forEach(name => {
    // 如果不相等 但是大写的都相等 就统一格式化一下
    if (name !== normalizeName && name.toLowerCase() === normalizeName.toLowerCase()) {
      headers[normalizeName] = headers[name];
      delete headers[name];
    }
  })
}

export function processHeaders(headers: any, data: any): any {
  normalizeHeaderName(headers, 'Content-Type');
  if (isPlainObject(data)) {
    // Content-Type 可能这样传 content-type 所以我们要用一个函数来规范化传进来的参数
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json; charset=utf-8';
    }
  }
  return headers;
}
```

## 获取响应数据

### 需求分析

从网络层接收到服务端返回的数据，但是代码层面没有任何关于返回数据的处理，我们希望处理服务端响应的数据。并支持promise调用。
```js
axios({
  method: 'post',
  url: '/base/post',
  data: {
    a: 1,
    b: 2
  }
}).then(res => {
  console.log(res);
})
```

可以这样拿到res对象，希望该对象包括

* 服务端返回的数据 data
* HTTP状态码status
* 状态消息 statusText
* 响应头 headers
* 请求配置对象 config
* 请求的XMLHttpRequest对象实例 request

### 定义接口类型

定义一个 AxiosResponse 接口类型。

```ts
// 都是要返回的请求数据
export interface AxiosResponse {
  data: any,
  status: number,
  statusText: string,
  headers: any,
  config: AxiosRequestConfig,
  request: any
}
```

### 处理响应的data

如果不设置 responseType的时候，服务端会返回一个字符串类型，我们可以尝试去转换一个JSON对象。
```ts
export function transformResponse(data: any): any {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch(e) {
      // do nothing
    }
  }
  return data;
}

function axios(config: AxiosRequestConfig): AxiosPromise {
  processConfig(config);
  return xhr(config).then(res => {
    // 最后这里对返回的数据处理一下
    return transformResponseData(res);
  });
}
```

### 错误信息增强 AxiosError 类

定义AxiosError类型接口 用于外部使用 types/index.ts

```ts


```

#### 注意一个ts的问题 

**Extending built-ins like Error Array、and Map may no longer work**。

继承内置对象可以能不工作 某些实例上面不能调用到类的方法。同时 实例的instanceof AError 返回false。

```ts
class AError extends Error {
  isAxiosError: boolean
  message: string

  constructor(message: string) {
    super(message);

    // 解决方法是 显示的设置原型 prototype
    Object.setProperty(this, AError.prototype);
  }

  sayHello() {
    console.log(this.message);
    return 'hello ' + this.message;
  }
}

let rr = new AError('error');
rr.sayHello(); //  err.sayHello is not a function
```

## 扩展接口

### 需求
为了更方便的使用 axios 发送请求，我们可以为所有支持请求额方法扩展统一的接口。

* axios.request(config)
* axios.get(url[, config])  axios.post(url[,data [, config]])
* 以及其他的请求方法 


axios 不再是一个方法，更像是一个混合对象，本身是一个方法，又有很多方法属性。

### 接口类型定义

Axios 混合对象定义接口

```typescript
export interface Axios {
  request(config: AxiosRequestConfig): AxiosPromise
  
  get(url: string, config?: AxiosRequestConfig): AxiosPromise

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise
  
  head(url: string, config?: AxiosRequestConfig): AxiosPromise

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise
}

export interface AxiosInstance extends Axios {
  (config: AxiosRequestConfig): AxiosPromise
}
```

### 混合对象的实现
首先这个对象是一个函数，其次这个对象需要包括 Axios类的所有原型属性和实例属性，首先来实现一个辅助函数 extend。

```typescript
export function extend<T, U>(to: T, from: U): T & U {
  for (const key in from) {
    ;(to as T & U)[key] = from[key] as any;
  }
  return to as T & U;
}

function createInstance(): AxiosInstance {
  const contenxt = new Axios();
  // instance 是一个函数 调用的是Axios的request方法
  const instance = Axios.prototype.request.bind(contenxt);
  // 把axios实例的方法和属性都拷贝到 instance上 这样他作为混合对象 也能使用axios上的方法
  extend(instance, contenxt);
  return instance as AxiosInstance;
}

const axios = createInstance();

export default axios;

// 在使用的时候 这样调用 他会调用Axios上的request方法 
axios(config);
axios.request(config);
axios.get(url, config);
```

### 响应数据支持泛型

通常会把后端返回的数据格式单独放入一个interface里面。

```typescript
// 接口请求数据
export interface ResponseData<T = any> {
  // 状态码
  // @type { number }
  code: number;

  result: T;

  message: string
}

export interface AxiosResponse<T = any> {
  data: T,
  status: number,
  statusText: string,
  headers: any,
  config: AxiosRequestConfig,
  request: any
}

// 使用
interface User {
  name: string,
  age: number
}

function getUser<T>() {
  return axios<ResponseData<T>>('/extend/user')
  .then(res => res.data)
  .catch(err => console.log(err));
}

async function test() {
  // 这里的user 会推出出上面 ResponseData 而 ResponseData 是 AxiosResponse的T泛型
  const user = await getUser<User>();
  if (user) {
    console.log(user.result.name);
  }
}

test();
```

#### node的返回信息

```js
// 路由信息
router.get('/extend/user', function(req, res) {
    res.json({
      code: 0,
      message: 'ok',
      result: {
        name: 'jack',
        age: 18
      }
    })
  })
```

## 拦截器

一般我们希望能对发送的请求和响应做拦截，也就是在发送请求之前和接收数据之后做一些额外的逻辑：
```javascript
// 请求的拦截器
axios.interceptors.request.use(function(config) {
  // 发送请求之前做什么
  return config;
}, function(error) {
  return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function(response) {
  // 处理响应数据
  return response;
}, function(error) {
  return Promise.reject(error);
});
```

### 拦截器管理类实现

axios拥有一个拦截器 interceptors 对象，该属性有 request和response两个属性。他们对外提供一个use方法来添加拦截器。
可以把这两个属性看做是一个拦截器管理对象，用一个InterceptorManager构造函数返回的数据。use方法支持2个参数，第一个是resolve函数，第二个是reject函数。 
resolve函数的参数，请求拦截器是 AxiosRequestConfig 类型的，而响应拦截器是AxiosResponse类型的，reject函数的参数是any类型的。


```typescript
export interface AxiosInterceptorManager<T> {
  user(resolved: ResolvedFn<T>, rejected: RejectedFn): number

  eject(id: number): void
}

export interface ResolvedFn<T> {
  (val: T): T | Promise<T>
}

export interface RejectedFn {
  val: any
}

// InterceptorManager 实例的里面保存的拦截器对象
interface Interceptor<T> {
  resolved: ResolvedFn<T>
  rejected?: RejectedFn
}

/**
 * axios.interceptor.response 和 request
 */
export default class InterceptorManager<T> {
  // 这里因为要删除某个拦截器 所以加一个null 作为联合类型
  private interceptors: Array<Interceptor<T> | null>

  constructor() {
    this.interceptors = [];
  }

  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number {
    this.interceptors.push({
      resolved,
      rejected
    });
    return this.interceptors.length - 1;
  }

  eject(id: number): void {
    // 这里判断一下 是否存在 然后把某个拦截器至为null 这里不能使用splice删除 否则顺序id会乱掉
    // 后面再循环拦截器数组的时候 会跳过null的值
    if (this.interceptors[id]) {
      this.interceptors[id] = null;
    }
  }

  forEach(fn: (interceptor: Interceptor<T>) => void): void {
    this.interceptors.forEach(interceptor => {
      if (interceptor !== null) {
        fn(interceptor);
      }
    });
  }
}
```



### 链式调用

```typescript
    const chain: PromiseChain<any>[] = [{
      resolved: dispatchRequest,
      rejected: undefined
    }];

    // 请求拦截器后添加的先执行
    this.interceptors.request.forEach(interceptor => {
      chain.unshift(interceptor)
    });

    // 相应拦截器先添加的先执行
    this.interceptors.response.forEach(interceptor => {
      chain.push(interceptor)
    });

    let promise = Promise.resolve(config);

    while (chain.length) {
      const { resolved, rejected } = chain.shift()!;
      promise = promise.then(resolved, rejected);
    }

    return promise;

// 伪代码

// config 是 用户配置和默认配置合并的
var promise = Promise.resolve(config);
promise.then('请求成功', '请求失败')
.then('请求成功', '请求失败')
.then(dispatchRequest, undefined)
.then('响应成功', '响应失败')
.then('响应成功', '响应失败')
.then('业务处理')
```


## 默认配置

默认配置在发送请求时候有自己的一些默认行为，也可以合并用户传的配置。 在axios 上面加一个 defaults 属性，表示默认配置。你可以直接修改这些配置。

```js
axios.defaults.headers.common['test'] = '112'   

const defaults: AxiosRequestConfig = {
  method: 'get',

  timeout: 0,

  headers: {
    common: {
      Accept: 'application/json; text/plain, */*'
    }
  },

  transformRequest: [
    function(data: any, headers?: any): any {
      processHeaders(headers, data);
      return transformRequest(data);
    }
  ],

  transformResponse: [
    function(data: any): any {
      return transformResponse(data);
    }
  ]
};
```

### 创建新的实例
目前上面的axios只是个单例，一旦修改了默认配置就会影响到所有的请求。希望可以实现一个创建实例的方法，来生成一个新的实例，传入自己的配置和默认配置做合并。axios.create();

```typescript
export interface AxiosInstance extends Axios {
  <T = any>(config: AxiosRequestConfig): AxiosPromise<T>

  <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
} 

export interface AxiosStatic extends AxiosInstance {
  create(config: AxiosRequestConfig): AxiosInstance
}

// 创建一个实例
function createInstance(config: AxiosRequestConfig): AxiosStatic {
  const contenxt = new Axios(config)
  const instance = Axios.prototype.request.bind(contenxt)

  extend(instance, contenxt)

  return instance as AxiosStatic;
}

const axios = createInstance(defaults);

axios.create = function create(config) {
  // 合并默认参数和传进来的参数 这样就不需要去 axios.defaults 上面修改配置
  return createInstance(mergeConfig(defaults, config));
};
```



**dispatchRequest 最终处理axios 发起请求的函数，过程如下**

1. 取消请求的处理和判断
2. 处理 参数和默认参数
3. 使用相对应的环境 adapter 发送请求(浏览器环境使用 XMLRequest 对象、Node 使用 http 对象)
4. 返回后抛出取消请求 message，根据配置 transformData 转换 响应数据

## 取消请求

在有些极端的情况下，网络很差的时候，我们前一个请求还没有返回结果的时候，可能会存在下一个请求出去了。
接口响应时长是不确定的，如果先发出去的请求，但是结果却比后发出去的请求慢，这样数据就乱了。所以这种情况需要保证后面的请求
发出去之前确保前面的请求已经返回了结果，如果没有前面响应，需要取消后面的请求。使用 *cancel token* 取消请求



```javascript
// 取消的代码
const CancelToken = axios.CancelToken;
const source = CancelToken.source();

axios.get('/user/12345', {
  cancelToken: source.token
}).catch(function(thrown) {
  if (axios.isCancel(thrown)) {
    console.log('Request canceled', thrown.message);
  } else {
     // 处理错误
  }
});

axios.post('/user/12345', {
  name: 'new name'
}, {
  cancelToken: source.token
})

// 取消请求（message 参数是可选的）
source.cancel('Operation canceled by the user.');


// 构造函数
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

function CancelToken(executor) {
  if (typeof executor !== "function") {
    throw new TypeError("executor must be a function.");
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}
```

根据构造函数可以知道 axios.CancelToken.source().token 最终拿到的实例下挂载了 promise 和 reason 两个属性，promise 属性是一个处于 pending 状态的 promise 实例，reason 是执行 cancel 方法后传入的 message。而 axios.CancelToken.source().cancel 是一个函数方法，负责判断是否执行，若未执行拿到 axios.CancelToken.source().token.promise 中 executor 的 resolve 参数，作为触发器，触发处于处于 pending 状态中的 promise 并且  传入的 message 挂载在 xios.CancelToken.source().token.reason 下。若有  已经挂载在 reason 下则返回防止反复触发。而这个 pending 状态的 promise 在 cancel 后又是怎么进入 axios 总体 promise 的 rejected 中呢。我们需要看看 adpater 中的处理：

```javascript
//如果有cancelToken
if (config.cancelToken) {
  config.cancelToken.promise.then(function onCanceled(cancel) {
    if (!request) {
      return;
    }
    //取消请求
    request.abort();
    //axios的promise进入rejected
    reject(cancel);
    // 清楚request请求对象
    request = null;
  });
}

```

1、axios.CancelToken.source()返回一个对象，tokens 属性 CancelToken 类的实例，cancel 是 tokens 内部 promise 的 resove 触发器

2、axios 的 config 接受了 CancelToken 类的实例

3、当 cancel 触发处于 pending 中的 tokens.promise，取消请求，把 axios 的 promise 走向 rejected 状态




### 异步分离

要取消请求，我们需要为该请求配置一个 cancelToken，然后在外部调用一个 cancel 方法。

请求的发送是一个异步过程，最终会执行 xhr.send方法，xhr 对象提供了abort方法，可以把请求取消，我们在外部碰不到 xhr对象，
所以在执行cancel的时候 执行 xhr.abort 方法。

可以利用 Promise 实现异步分离，也就是在 cancelToken 中保存一个 pending状态的 Promise 对象，然后当我们执行 cancel 方法的时候，
能够访问到这个 Promise对象，把pending状态 改成 resolved状态，这样就可以在 then 函数中去实现取消请求的逻辑。

```typescript

```

#### 借用尼库桑的图

![border](https://pic3.zhimg.com/v2-a35d475ecf0d4ad1029551214a70bca9_b.jpg)



### withCredentials

浏览器的同源策略限制有时候会出现跨越请求问题，一般来说主流的有两种方案。 CORS 和 代理。

* CORS 对前端来说没什么工作量。每一次请求 浏览器会先以 OPTIONS 请求方式发送一个预请求（也不是所有请求都会发送options [详细](https://panjiachen.github.io/awesome-bookmarks/blog/cs.html#cors)）,通过预检请求从而获知服务器端对跨源请求支持的HTTP方法。在确认服务器允许该跨源请求后，再以实际的 HTTP 请求方法发送那个真正的请求。一次配好 多次使用。详细[MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)

* 纯前端的方法是代理。 dev开发模式下 可以使用webpack的 proxy 使用也是很方便，参照[文档](https://www.webpackjs.com/configuration/dev-server/#devserver-proxy)。在生产环境下 需要使用 nginx 反向代理。

XMLHttpRequest.withCredentials  属性是一个Boolean类型，它指示了是否该使用类似cookies,authorization headers(头部授权)或者TLS客户端证书这一类资格证书来创建一个跨站点访问控制（cross-site Access-Control）请求。在同一个站点下使用withCredentials属性是无效的。

** 不同域下的XmlHttpRequest 响应，不论其Access-Control- header 设置什么值，都无法为它自身站点设置cookie值，除非它在请求之前将withCredentials 设为true。**



### CSRF 跨站请求伪造。是一种挟持用户在当前已登录的 Web 应用程序上执行

CSRF 利用用户的登录状态发起恶意请求。

跨站伪造攻击，















