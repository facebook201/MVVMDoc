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


  