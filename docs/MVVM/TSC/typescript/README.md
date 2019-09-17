# 基础

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
**枚举类型用于取值被限定在一定场景，比如一周七天，彩虹的颜色等， 枚举的成员会被赋值为从0开始递增的数字。**
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

// 
enum Days {Sun, Mon, Tue, Wed, Thu, Fri, Sat};
let day: Days = Days.Sun;
console.log(day === 0); // true

// 代码会编译成这样
var Days;
(function (Days) {
    Days[Days["Sun"] = 0] = "Sun";
    Days[Days["Mon"] = 1] = "Mon";
    Days[Days["Tue"] = 2] = "Tue";
    Days[Days["Wed"] = 3] = "Wed";
    Days[Days["Thu"] = 4] = "Thu";
    Days[Days["Fri"] = 5] = "Fri";
    Days[Days["Sat"] = 6] = "Sat";
})(Days || (Days = {}));
```

### 手动赋值
```typescript
enum Days {Sun = 7, Mon = 1, Tue, Wed, Thu, Fri, Sat};

console.log(Days["Sun"] === 7); // true
console.log(Days["Mon"] === 1); // true
console.log(Days["Tue"] === 2); // true
console.log(Days["Sat"] === 6); // true
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

### 未声明类型的变量
变量如果在声明的时候，未指定其类型，那么它会被识别为任意值类型。
```typescript
let something;
something = 'seven';
something = 7;
```
### 联合类型
联合类型（Union Types）表示取值可以为多种类型中的一种。联合类型使用 | 分隔每个类型。这里的 let myFavoriteNumber: string | number 的含义是，允许 myFavoriteNumber 的类型是 string 或者 number，但是不能是其他类型。
```typescript
let myFavoriteNumber: string | number;
myFavoriteNumber = 'seven';
myFavoriteNumber = 7;
```

**联合类型的属性和方法**
当不能确定联合类型的变量是哪一个，我们只能访问此联合类型的所有类型里的共有属性或方法:
```typescript
function getLength(something: string | number): number {
    return something.length;
}
// index.ts(2,22): error TS2339: Property 'length' does not exist on type 'string | number'.
//   Property 'length' does not exist on type 'number'.
function getString(something: string | number): string {
    return something.toString();
}

let myFavoriteNumber: string | number;
myFavoriteNumber = 'seven';
console.log(myFavoriteNumber.length); // 5
myFavoriteNumber = 7;
console.log(myFavoriteNumber.length); // 编译时报错
// index.ts(5,30): error TS2339: Property 'length' does not exist on type 'number'.
```

## 接口 Interface
**在typescript里面，使用接口来定义对象类型，** 接口是对行为的抽象，具体行动需要类去实现。

* 接口首字母大写
* 定义的变量不能比接口少，也不能多 **赋值的时候回要跟接口保持一致**
* 可选属性 ?: 不需要完全匹配，但是不能添加未定义的属性
* 任意属性 [propName: string]: any **任意属性定义了，那么确定属性和可选属性的类型都必须是它的子集**
* 只读属性 readonly **只读属性约束在于第一次给对象赋值的时候，而不是第一次给只读属性赋值的时候**

```typescript
interface Person {
  name: string,
  age: number
}

let tom: Person = {
  name: 'zhangsan',
  age: 23
};
```
定义了接口Person，**变量tom的类型是Person，这样tom要跟Person保持一致。不能多属性也不能少属性。必须保持一致**

### 可选属性
有时候不要完全匹配一个形状。表示可用不存在这个属性，但是不能添加未定义的熟悉
```typescript
interface Person {
    name: string;
    age?: number;
}

let tom: Person = {
    name: 'Tom'
};
```

### 任意属性
```typescript
interface Person {
  name: string;
  age?: number;
  [propName: string]: any;
}

let tom: Person = {
  name: 'Tom',
  gender: 'male'
};
```

**一旦定义了任意属性，那么确定属性和可选属性的类型都必须是它的类型的子集:** 
```typescript
interface Person {
  name: string;
  age?: number;
  [propName: string]: string;
}
let tom: Person = {
  name: 'Tom',
  age: 25,
  gender: 'male'
};
// index.ts(3,5): error TS2411: Property 'age' of type 'number' is not assignable to string index type 'string'.
// index.ts(7,5): error TS2322: Type '{ [x: string]: string | number; name: string; age: number; gender: string; }' is not assignable to type 'Person'.
//   Index signatures are incompatible.
//     Type 'string | number' is not assignable to type 'string'.
//       Type 'number' is not assignable to type 'string'.
```

### 只读属性
有时候希望对象的一些字段只能在创建的时候被赋值，不能改变，可以使用readonly 定义只读属性，**注意，只读的约束存在于第一次给对象赋值的时候，而不是第一次给只读属性赋值的时候**
```typescript
interface Person {
    readonly id: number;
    name: string;
    age?: number;
    [propName: string]: any;
}
let tom: Person = {
    id: 89757,
    name: 'Tom',
    gender: 'male'
};
tom.id = 9527;
// 不能给id赋值了 因为id是只读的属性
```

### 函数类型
一个函数有输入和输出，TS对其进行约束，需要把输入和输出考虑到，其中函数声明的类型定义较为简单。
**注意，输入多余的（或者少于要求的）参数，是不被允许的，可选参数使用?:表示，但是可选参数必须在必须参数后面。**
```typescript
function sum(x: number, y: number): number {
    return x + y;
}
// 可选参数
function buildName(firstName: string, lastName?: string) {
    if (lastName) {
        return firstName + ' ' + lastName;
    } else {
        return firstName;
    }
}
let tomcat = buildName('Tom', 'Cat');
let tom = buildName('Tom');
```

### 默认参数
在ES6中 允许给函数的参数添加默认值，TypeScript 会将添加了默认值的参数识别为可选参数
```typescript
function buildName(firstName: string, lastName: string = 'Cat') {
    return firstName + ' ' + lastName;
}
let tomcat = buildName('Tom', 'Cat');
let tom = buildName('Tom');
```

### 剩余参数
...ret 的方式获取函数中的剩余参数：items 是一个数组。所以我们可以用数组的类型来定义它.**rest 参数只能是最后一个参数**
```typescript
function push(array: any[], ...items: any[]) {
    items.forEach(function(item) {
        array.push(item);
    });
}

let a = [];
push(a, 1, 2, 3);
```

### 接口定义函数的形状

```typescript
// 定义接口 里面是函数参数的定义和返回值
interface SearchFunc {
  (source: string, substring: string): boolean;
}

let mySearch: SearchFunc;

mySearch = function(sourc: string, substring: string) {
  return sourc.search(substring) !== -1;
}
```


## 类型断言
指定一个值的类型。 **TS可以允许你覆盖它的推断，并且能以你任何你想要的方式分析它。用它来告诉编译器你更了解这个类型**

* <类型> 值  
* 值 as 类型
在jsx语法中必须是后一种。为了保持一致性，尽量都使用as。

```typescript
const foo = {};
// 这两种都是错误的，属性都不存在foo里面。因为ts推断出foo是一个对象。你不能添加属性
foo.bar = 123;
foo.bas = 'hello';

interface Foo {
  bar: number;
  bas: string;
}

const foo = {} as Foo;
foo.bar = 123;
foo.bas = 'hello';
```

## 抽象类
抽象类做为其它派生类的基类使用。 它们一般不会直接被实例化。 不同于接口，抽象类可以包含成员的实现细节。abstract关键字是用于定义抽象类和在抽象类内部定义抽象方法。抽象类中的抽象方法不包含具体实现并且必须在派生类中实现。抽象方法的语法与接口方法相似。 两者都是定义方法签名但不包含方法体。 然而，抽象方法必须包含abstract关键字并且可以包含访问修饰符。

```typescript

abstract class Department {

    constructor(public name: string) {
    }

    printName(): void {
        console.log('Department name: ' + this.name);
    }

    abstract printMeeting(): void; // 必须在派生类中实现
}

class AccountingDepartment extends Department {
    constructor() {
        super('Accounting and Auditing'); // 在派生类的构造函数中必须调用 super()
    }
    // 派生类中必须实现抽象基类中的抽象方法
    printMeeting(): void {
        console.log('The Accounting Department meets each Monday at 10am.');
    }
    generateReports(): void {
        console.log('Generating accounting reports...');
    }
}
let department: Department; // 允许创建一个对抽象类型的引用
department = new Department(); // 错误: 不能创建一个抽象类的实例
department = new AccountingDepartment(); // 允许对一个抽象子类进行实例化和赋值
department.printName();
department.printMeeting();
department.generateReports(); // 错误: 方法在声明的抽象类中不存在
```