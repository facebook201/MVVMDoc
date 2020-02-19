# Typescript 高级类型


## 索引类型（Index types）

索引类型 编译器可以检查使用了动态属性名的代码。 下面的代码检查了name是否真的是 Person的一个属性。
```tsx
function pluck<T, K extends keyof T>(o: T, names: K[]): T[K][] {
  return names.map(n => o[n]);
}

interface Person {
  name: string;
  age: number;
}

let person: Person = {
  name: 'zhangsan',
  age: 12
};

let strings: string[] = pluck(person, ['name']); // ['zhangsan']
```

**keyof T** keyof 是索引类型查询操作符。对于任何类型 T，keyof T的结果是 T上已知的公共属性名的联合。in 可以遍历枚举类型。


```tsx
let personProps: keyof Person; // 'name' | 'age'

type Obj = {
  [p in personProps]: any
}; // { a: any, b: any }
```

**keyof 产生联合类型, in 则可以遍历枚举类型, 所以他们经常一起使用, 看下 Partial 源码,也是下面要说到的映射类型**

```tsx
type partial<T> = { [P in key of T]?: T[P] };
```

## 映射类型

一个常见的任务是将一个已知的类型 每个属性都变为可选的。
```typescript
interface Person {
  name?: string;
  age?: number
}

interface PersonReadonly {
    readonly name: string;
    readonly age: number;
}

// 把对象里面的属性都映射为 其他类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P]
};

```

## Typescript冷门好用的特性

#### typeof 获取一个值的类型

```tsx
let defaultState = {
  foo: 3,
  bar: 'hello'
};

type State = typeof defaultState;

let nextState: State = {
  foo: 'seven',
  bar: 'wolrd'
};

// 不能将类型 string 分配给类型 number
```

#### 获取一个函数的返回值的类型

```tsx
function getState() {
  return {
    foo: 4,
    bar: 'hello'
  };
}

type ReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : any;

type State = ReturnType<typeof getState>;

let nextState: State = {
  foo: 'seven',
  bar: 'world'
};
// 不能将类型 string 分配给类型 number
```

#### Partial 将一个类型中所有属性都变成可选属性

```tsx
let defaultState = {
  foo: 7,
  bar: 'hello'
};

type PartialState = Partial<typeof defaultState>;

let partialState: PartialState = {
  foo: 8
};
```

#### 取出一个类型中的部分属性，生成另一个类型

```tsx
let defaultState = {
  foo: 7,
  bar: 'hello'
};

type PickedState = Pick<typeof defaultState, 'foo'>;

let partialState: PickedState = {
  foo: 8,
  bar: 'hello'
};

// 对象文字可以指定已知属性，并且bar不在类型Pick中
```

#### Required 将所有 props 属性都设为必填项

```tsx
type Required<T> = { [P in keyof T]-?: T[P] }
```

-? 的功能就是将可选属性的 ？去掉。使该属性变成必选项。


#### Exclude<T, U>

从T中排除那些可以赋值给 U 的类型。

```tsx
type Exclude<T, U> = T extends U ? never : T;

// 实例
type T = Exclude<1|2|3|4|5, 3|4>; // T 1|2|5
```

此时 T 类型的值只可以为 1、2、5 当使用其他值是TS会进行错误提示。

#### Extract<T, U>

```tsx
type Extract<T, U> = T extends U ? T : never;

// 实例
type T = Extract<1|2|3|4|5, 3|4>; // T 3, 4
```

#### Pick\<T, K>

从 T 中取出一系列 K 的属性。

```tsx
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
};
```

#### Record<T, K>
将 K 中所有的属性的值转化为 T 类型，这个记录的比较少 但是功能很强大。

```tsx
type Record<K extends keyof any, T> = {
  [P in K]: T;
};
```


#### Omit<T, K>(没有内置)

从对象 T中排除 key 是 K 的属性，例如在复用类型里面，有时候又不需要里面所有的属性，因此需要剔除某些属性。
在React中经常用到，父组件通过props向下传递数据。通常需要复用父组件的props类型，但是又需要剔除一些无用的。
由于TS中没有内置，所以需要我们使用 Pick 和 Exclude 进行实现。

```tsx
// Exclude<keyof T, K> 去掉 T 里面 K 的属性
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;


interface Person {
  name: string,
  age: number,
  sex: string,
}

let person: Omit<Person, 'name'> = {
  age: 1,
  sex: '男'
};
```

#### Nonullable\<T>

排除 T 为 null、undefined的值

```tsx
type NonNullable<T> = T extends null | undefined ? never : T;
```