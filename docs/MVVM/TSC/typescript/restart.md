# 重学TS

## 基础类型

### unknown

```ts
let value: unknown;

value = true; // OK
value = 23; // OK

let value1: boolean = value; // Error
let value2: number = value; // Error
```

当声明为unknown的变量，给他赋其他的值是可以的，但是如果赋给其他类型的变量屎就报错。unknown 类型只能被赋值给 any 类型和 unknown 类型本身。直观地说，这是有道理的：只有能够保存任意类型值的容器才能保存 unknown 类型的值。毕竟我们不知道变量 value 中存储了什么类型的值。


### void 类型

void类型像是与 any类型相反，它表示没有任何类型。当一个函数没有返回值时，通常会见到其返回值类型是void。

### Never 类型
never 类型表示那些永不存在的值得类型。例如 抛出异常或根本不会有返回值的函数表达式或箭头函数表达式的返回值类型。

```ts
// 返回never的函数必须存在无法达到的终点
function error(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}
```

### keyof 操作符

keyof操作符可以用于获取某种类型的所有键（也是属性名的联合），其返回类型是联合类型。

```ts
const COLORS = {
  red: 'red',
  blue: 'blue'
};

type Colors = keyof typeof COLORS;

let color: Colors; // 'red' 'blue' union type 生成一个联合类型
```





## 编写高效的TS代码



### 减少重复的代码

对于重复定义的接口或者对象，可以使用 **extends 去继承、交叉运算符 & 、typeof 运算符、 提取统一的类型签名**

* typeof 操作符来快速获取配置对象的「形状」

```ts
interface Person {
    firstName: string
    lastName: string
};

// 再次定义一个 birth
interface PersonWithBirthDate extends Person {
    birth: Date
}

// 或者 使用 &

type PersonWithBirthDate = Person & { birth: Date };


// 类型签名
type HTTPFn = (url: string, opts: Options) => Promise<Response>;

const get: HTTPFn = (url, opts) => {};
const post: HTTPFn = (url, opts) => {};

const INIT_OPTIONS = {
  width: 640,
  height: 480,
  color: "#00FF00",
  label: "VGA",
};

type Options = typeof INIT_OPTIONS;
// 等价
interface Options {
  width: number;
  height: number;
  color: string;
  label: string;
}
```



###  使用精确的类型替代字符串类型

例如现在要构建一个音乐专辑 Album。

```ts
interface Album {
  artist: string; // 艺术家
  title: string; // 专辑标题
  releaseDate: string; // 发行日期：YYYY-MM-DD
  recordingType: string; // 录制类型："live" 或 "studio"
}

// 使用更加精确的类型
interface Album {
  artist: string; // 艺术家
  title: string; // 专辑标题
  releaseDate: Date; // 发行日期：YYYY-MM-DD
  recordingType: "studio" | "live"; // 录制类型："live" 或 "studio"
}
```



### pluck 从一个对象数组中抽取某个属性的值并保存到数组

**`keyof T`， **索引类型查询操作符**。 对于任何类型 `T`， `keyof T`的结果为 `T`上已知的公共属性名的联合。**

```tsx
function pluck<T, K extends keyof T>(record: T[], key: K): T[K][] {
  return record.map((r) => r[key]);
}

```





## 常见问题处理



### 在window对象上显式设置属性

```tsx
declare interface Window {
  MyNamespace: any;
}

window.MyNamespace = window.MyNamespace || {};
```



### 为对象动态分配属性 

### 索引签名

```ts
interface LooseObject {
  [key: string]: any
}

type Record<K extends string, T> = {
  [P in K]: T;
};

```





## type 和 interface

* 接口和类型别名都可以用来描述对象的形状或函数签名。

* 与接口类型不一样，类型别名可以用于一些其他类型，比如原始类型、联合类型和元组

* 接口和类型别名都能够被扩展，但语法有所不同。此外，接口和类型别名不是互斥的。接口可以扩展类型别名，而反过来是不行的。

* 类可以以相同的方式实现接口或类型别名，但类不能实现使用类型别名定义的联合类型

* 与类型别名不同，接口可以定义多次，会被自动合并为单个接口。

  



## 工具类型



### typeof 操作符

用来获取一个变量声明或对象的类型。

```ts
interface Person {
  name: string;
  age: number;
}

const sem: Person = { name: 'semlinker', age: 30 };
type Sem= typeof sem; // -> Person
```





### keyof 操作符

用来获取一个对象中所有的key值

```ts
interface Person {
    name: string;
    age: number;
}

type K1 = keyof Person; // "name" | "age"
```



### in 

遍历枚举类型

```ts
type Keys = "a" | "b" | "c"

type Obj =  {
  [p in Keys]: any
} // -> { a: any, b: any, c: any }
```













## extends 和 infer 重点

> **TypeScript 2.8引入了*有条件类型，T extends U ? X : Y ，若`T`能够赋值给`U`，那么类型是`X`，否则为`Y`**
>
> ### 有条件类型中的类型推断
>
> 现在在有条件类型的`extends`子语句中，允许出现`infer`声明，它会引入一个**待推断的类型变量**。
>
> 官方的解释：**`infer` 关键词常在条件类型中和 `extends` 关键词一同出现，表示将要推断的类型，作为类型变量可以在三元表达式的 True 部分引用（注意在True的部分使用）。而 `ReturnType` 正是使用这种方式提取到了函数的返回类型。**

```ts
type NonNullable<T> = T extends null | undefined ? never : T;

// 如果泛型参数T 为 null 或 undefined，那么取 never，否则直接返回T
let demo1: NonNullable<number>; // => number
let demo2: NonNullable<string>; // => string
let demo3: NonNullable<undefined | null>; // => never
```



### infer

表示在extends 条件语句中待推断的类型变量。

```ts
// 官方
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

上面这个例子第一次看，一脸懵圈。**infer R 相当于声明了一个变量，这个变量随后可以使用。** 先看看下面的例子

```ts
// 如果泛型变量T是 () => infer R的`子集`，
// 那么返回 通过infer获取到的函数返回值，否则返回boolean类型
type Func<T> = T extends () => infer R ? R : boolean;


let fun1: Func<number>; // boolean
let fun2: Func<''>; // boolean
let fun3: Func<() => Promise<number>>; // Promise<number>
```



### Vue3 源码

```ts
// 如果泛型变量T是ComputedRef的'子集'，那么使用UnwrapRefSimple处理infer指代的ComputedRef泛型参数V
// 否则进一步判断是否为Ref的'子集'，进一步UnwrapRefSimple

export type UnwrapRef<T> = T extends ComputedRef<infer V>
    ? UnwrapRefSimple<V>
    : T extends Ref<infer V> ? UnwrapRefSimple<V> : UnwrapRefSimple<T>

type UnwrappedObject<T> = { [P in keyof T]: UnwrapRef<T[P]> } & SymbolExtract<T>

export interface Ref<T = any> {
    [Symbol()]: true
    value: T
}

type UnwrapRefSimple<T> = T extends Function | CollectionTypes | BaseTypes | Ref
    ? T
    : T extends Array<any>
    ? T extends object
    ? UnwrappedObject<T>
    : T
```



### Leetcode 面试题

```ts
interface Logger {
  time: number;
  asyncLog:(msg: string) => Promise<string>;
  syncLog:(msg: string) => number;
}

type Translate<T> = /** 你需要实现的部分 **/;

// 要求 Translate
//  1. 提取出为函数类型的属性，丢弃掉其它类型的属性
//  2. 将函数返回类型调整为形参类型(假定有且只有一个参数)

// 实现效果如下:
type T0 = Translate<Logger>;

// 等价于
type T0 = {
    // 其它属性被丢弃
    asyncLog: (arg: string) => string; 
    // return 类型被调整为跟 arg 保持一致
    syncLog: (arg: string) => string; 
    // return 类型被调整为跟 arg 保持一致
}

const result: T0 = {
    asyncLog(msg: string) { return msg }
};
```



**去掉 time 剔除指定的类型**

```ts
// 如果T 能 赋值给 U 就返回 never 那么表示 去掉T里面包含U的值
// 
type Exclude1<T, U> = T extends U ? never : T;

// 选出一系列K的属性
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
};

// Omit 没有内置 从 T 排除 key 是 K的属性
type Omit<T, K> = Pick<T, Exclud<keyof T, K>>;

interface Logger {
    time: number;
    asyncLog: (msg: string) => Promise<string>;
    syncLog: (msg: string) => number;
}

// 去掉 time属性 返回其余两个
Omit<Logger, 'time'>
  
  
// 最后用infer 将函数的返回类型改成参数类型
 type ArgAsReturn<T> = {
    [P in keyof T]: T[P] extends ((arg: infer U) => any) ? ((arg: U) => U) : never;
};
```





### Leetcode 面试题



**题目链接![https://github.com/LeetCode-OpenSource/hire/blob/master/typescript_zh.md]**

```ts
interface Action<T> {
    payload?: T
    type: string
}


class EffectModule {
    count = 1;
    message = 'hello';

    delay(input: Promise<number>) {
        return input.then(i => ({
            payload: `hello ${i}!`,
            type: 'delay'
        }));
    }

    setMessage(action: Action<Date>) {
        return {
            payload: action.payload!.getMilliseconds(),
            type: "set-message"
        };
    }
}


// 修改 Connect 的类型 让 connected 的类型变成预期的

type Connect = (module: EffectModule) => any

const connect: Connect = m => ({
    delay: (input: number) => ({
        type: 'delay',
        payload: 'hello 2'
    }),
    setMessage: (input: Date) => ({
        type: "set-message",
        payload: input.getMilliseconds()
    })
});

type Connected = {
    delay(input: number): Action<string>;
    setMessage(action: Date): Action<number>;
};

export const connected: Connected = connect(new EffectModule())

// 第一步去掉 多余的熟悉

type Exclude1<T, U> = T extends U ? never : T; 

type rest = Exclude1<keyof EffectModule, 'count' | 'message'>;

type pickValue = Pick<EffectModule, rest>;

type connectValue<T> = {
    [P in keyof T]:
        T[P] extends (arg: Promise<infer T>) => Promise<infer U>
        ? (arg: T) => U
        : T[P] extends (arg: Action<infer T>) => Action<infer U>
        ? (arg: T) => Action<U>
        : never;
};

type connect = connectValue<pickValue>;

```















