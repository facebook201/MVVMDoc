# TypeScript的简介

## 简介
TypeScript 是 JavaScript类型的超集，可以编译成 JavaScript。可以在任何浏览器、任何操作系统上运行。

* 支持ES6规范
* 静态类型检查


## 组成部分

* 模块
* 函数
* 变量
* 语句和表达式
* 注释

## 基础类型

### 字符串
支持 单引号、多引号、反引号` 和 表达式。

```typescript
let name: string = 'zhangsan';
let years: string = "2019";
let words: string = `我是${name}，今年${age}岁`;
```

### 布尔值
```typescript
let isDone: boolean = false;
```

### 数字
双精度64位浮点数值。可以表示整数和分数。
```typescript
let binaryLiteral: number = 0b1010; // 二进制
let octalLiteral: number = 0o744;    // 八进制
let decLiteral: number = 6;    // 十进制
let hexLiteral: number = 0xf00d;    // 十六进制
```
```typescript```
### 数组
TS 有两种方式定义。

* 元素类型后面跟 []
* 数组泛型 Array<元素类型>

```typescript
let list: number[] = [1, 2, 3];
let list: Array<number> = [1, 2, 3];
```

### 元组 Tuple
元组类型允许表示一个已知元素数量和类型的数组，各元素的类型不必相同
```typescript
let x: [string, number];
x = [12, 'change']; // OK
x = ['sad', 12]; // Error

x[0].substr(1); // OK
x[1].substr(1); // Error 'number' does not have 'substr
// 越界访问 会使用联合类型替代
x[3] = 'world'; // 字符串可以赋值给string或者 number
x[4].toString(); // OK
x[6] = true; // Error 不是两个类型中的一个
```

### 枚举
枚举是对JavaScript数据类型的补充，可以为一组数值赋予友好的名字。
```typescript
  enum Name { 'Tom', 'Jack' }
  let currName: Name = Name.Tom;
  // 默认情况下，从0开始为元素编号。 你也可以手动的指定成员的数值。
  enum Name { 'Tom' = 1, 'Jack' }
  let currName: Name = Name.Jack;
  // 或全部手动赋值
  enum Name { 'Tom' = 1, 'Jack' = 4 }
  // 枚举类型提供的一个便利是你可以由枚举的值得到它的名字。
  enum Name { 'Tom' = 1, 'Jack' = 4 }
  let currName: Name = Name[4];
  console.log(currName); // Jack
```

### Any
有时候，我们会想要为那些在编程阶段还不清楚类型的变量指定一个类型。 这些值可能来自于动态的内容，比如来自用户输入或第三方代码库。 这种情况下，我们不希望类型检查器对这些值进行检查而是直接让它们通过编译阶段的检查。 那么我们可以使用 any类型来标记这些变量
```typescript
let anytype: any = 3;
anytype = 'also can be string';
anytype= false; 
let anyArray : any[] = [ 1, true, '123'];
```

### Void
某种程度上来说，void类型像是与any类型相反，它表示没有任何类型。 当一个函数没有返回值时，你通常会见到其返回值类型是void,声明一个void类型的变量没有什么大用，因为你只能为它赋予undefined和null：
```typescript
  function warning() : void {
    console.log('warning');
  }
  // void的变量只能赋值为`undefined`或`null`;
```

### undefined 和 null
默认情况下null和undefined是所有类型的子类型。 就是说你可以把 null和undefined赋值给number类型的变量。然而，当你指定了--strictNullChecks标记，null和undefined只能赋值给void和它们各自。 这能避免 很多常见的问题。 也许在某处你想传入一个 string或null或undefined，你可以使用联合类型string | null | undefined。 再次说明，稍后我们会介绍联合类型。

```typescript
  let unsure : void = undefined;
  let un : undefined = undefined;
  let nu : null = null;
```

### 类型断言
类型断言可以告诉编译器，你知道自己在做什么，好比类型转换。
```typescript
let someValue: any = 'this is a string';
let strLen: number = (<string>someValue).length;
// as 语法 在TS里面使用 JSX语法 只有as支持
let strLen: number = (someValue as string).length; 
```


## 变量声明

