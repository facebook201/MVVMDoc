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





