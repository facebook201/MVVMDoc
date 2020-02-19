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