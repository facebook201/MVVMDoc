
# React 配合 Typescript的使用


## React JSX

### HTML 标签 VS 组件

React 不但能渲染 HTML标签（strings）也能渲染 React组件（classes）。JavaScript触发这些的原理是不同的。确定使用哪一种方式取决于首字母的大小写。 foo 被认为是 HTML标签，Foo被认为是一个组件。


### HTML 标签

一个HTML标签 被标记为 IntrinsicElements 类型。在安装的声明文件中 定义了主要标签的类型。
```typescript
declare namespace JSX {
  interface IntrinsicElements {
    a: React.HTMLAttributes;
    abbr: React.HTMLAttributes;
    div: React.HTMLAttributes;
    span: React.HTMLAttributes;
    //
  }
}
```

### 函数式组件

可以使用 React.FunctionComponent 接口定义函数组件，其实无状态的组件一般都是可以写成一个函数组件

``` tsx
type Props = {
  foo: string;
};

// 简写方式 FC
const MyComponent: React.FC<Props> = props => {
  return <span>{ props.foo }</span>
}

<MyComponent foo="bar" />;


// FC的声明
type PropsWithChildren<P> = P & { children?: ReactNode };

type FC<P = {}> = FunctionComponent<P>;

// TS 内置声明映射
type Partial<T> = {
  [P in keyof T]?: T[P]
};

interface FunctionComponent<P = {}> {
  (props: PropsWithChildren<P>, context?: any): ReactElement | null;
  propTypes?: WeakValidationMap<P>;
  contextTypes?: ValidationMap<any>;
  defaultProps?: Partial<P>;
  displayName?: string
}
```

### 有状态组件
有状态组件除了props之外还需要state，对于class写法的组件要泛型的支持，即Component<P, S>，因此需要传入传入state和props的类型，这样我们就可以正常使用props和state了。

```tsx
interface IProps {
  color: string,
  size?: string,
}
interface IState {
  count: number,
}
class App extends React.Component<IProps, IState> {
  public state = {
    count: 1,
  }
  public render () {
    return (
      <div>Hello world</div>
    )
  }
}
```

### Promise 类型

异步操作会经常使用到 async 函数。函数回调会return 一个 Promise 对象。 Promise<T> 是一个泛型类型， T 泛型变量用于确定使用 then方法时接收的第一个回调函数的参数类型。

```tsx
// 定义接口响应数据
interface ResponseData<T = any> {
  code: number;
  result: T,
  message: string
}

// 在 axios.ts 文件中对 axios 进行了处理，例如添加通用配置、拦截器等
import Ax from './axios';

import { ResponseData } from './interface.ts';

export function getUser<T>() {
  return Ax.get<ResponseData<T>>('/somepath')
    .then(res => res.data)
    .catch(err => console.error(err));
}

interface User {
  name: string;
  age: number;
}

async function test() {
  // user 被推断出为
  // {
  //  code: number,
  //  result: { name: string, age: number },
  //  message: string
  // }
  const user = await getUser<User>();
}
```









