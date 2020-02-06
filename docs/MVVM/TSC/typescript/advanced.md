# 进阶阶段

## Class 类
类相关的概念的介绍

* 类（Class）: 定义了一件事物的抽象特点，包含它的属性和方法
* 对象: 类的实例，通过new生成
* 面向对象的三大特性: 封装、继承、多态
* 封装: 将对数据的操作细节隐藏起来，只暴露对外的接口。外界调用端不需要（也不可能）知道细节，就能通过对外提供的接口来访问该对象，同时也保证了外界无法任意更改对象内部的数据
* 继承: 子类继承父类，子类除了拥有父类的所有特性外，还有一些更具体的特性
* 多态: 由继承而产生了相关的不同的类，对同一个方法可以有不同的响应。比如 Cat 和 Dog 都继承自 Animal，但是分别实现了自己的 eat 方法。此时针对某一个实例，我们无需了解它是 Cat 还是 Dog，就可以直接调用 eat 方法，程序会自动判断出来应该如何执行 eat
* 存取器（getter & setter) 改变属性的读取和赋值行为
* 修饰符: 修饰符是一些关键字，用于限定成员或类型的性质。比如 public 表示公有属性或方法
* 抽象类（Abstract Class): 抽象类是供其他类继承的基类，抽象类不允许被实例化。抽象类中的抽象方法必须在子类中被实现
* 接口: 不同类之间公有的属性或方法，可以抽象成一个接口。接口可以被类实现（implements）。一个类只能继承自另一个类，但是可以实现多个接口

### public private 和 protected
TS可以使用三种访问修饰符。公有、私有和受保护的。

* public 修饰属性或方法 可以被任何地方被访问。默认都是公有的
* private 修饰属性或方法 不能在声明它的类的外部访问
* protected 修饰的属性或方法是受保护的 子类中也是允许被访问。但是私有的子类不能被访问
* 抽象类 abstract 定义抽象类和抽象方法。 抽象类不能被实例化，继承的子类必须实现抽象方法。


## 泛型(Generics)
定义函数、接口、或类的时候。不预先指定具体的类型，而在使用的时候再指定类型的一种特性。

```typescript
function createArray(length: number, value: any): Array<any> {
  let result = [];

  for (let i = 0; i < length; i++) {
    result[i] = value;
  }
  return result;
}

createArray(2, 'x'); // ['x', 'x']
```
上面的函数的缺陷是，没有指定返回值得类型。

```typescript
function identity<T>(arg: T): T {
  return arg;
}
// 这里的T位类型变量 表示类型而不是值。 T帮助用户捕捉输入的类型，之后就可以使用这个类型。使用T作为返回类型，
// 就可以知道传入值和返回值是一个类型是相同的，这样就可以追踪函数里使用的类型的信息。就是泛型，可以适用多个类型
// 不会丢失信息 保持准确性 传入数值类型并返回数值类型。


let myIdentity: <T>(arg: T) => T = identity;

// <T>(arg: T) => T 作为整体，相当于 string，是对其左侧变量的约束。
// <T>(arg: T) => T 与 function identity<T>(arg: T): T 中的后半部分其实是一个意思，约束了函数identity 的参数类型和返回值的类型

// 传入所有参数
let output = identity<string>('string');

// 利用类型推断
let output = identity('string');

// 泛型接口
interface genFn<T> {
  (arg : T) : T;
}

let ide : genFn<number> = identity;

// 泛型类
// 泛型类指的是实例部分的类型，所以类的静态属性不能使用这个泛型类型。
class Gen<T> {
  zero: T;
  add: (x: T, y: T) => T;
}

let gen = new Gen<number>();

// 泛型约束中使用类型参数
function getProperty(obj: T, key: K) {
    return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };

getProperty(x, "a"); // okay
getProperty(x, "m"); // error: Argument of type 'm' isn't assignable to 'a' | 'b' | 'c' | 'd'.

// 泛型的默认值
function createArray<T = string>(length: number, value: T): Array<T> {
    let result: T[] = [];
    for (let i = 0; i < length; i++) {
        result[i] = value;
    }
    return result;
}
```

### 泛型约束

```typescript
// 泛型约束
// 利用接口来描述约束条件，然后使用这个接口和extends关键字实现约束
interface Lengthwise {
    length: number;
}

// 这时的泛型函数被定义了约束，因此它不再是适用于任何类型。
function loggingIdentity<T extends Lengthwise>(arg: T): T {
    console.log(arg.length);  // Now we know it has a .length property, so no more error
    return arg;
}


// 确保K参数继承T 是T的属性
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

let x = {a: 1, b: 2, c: 3, d: 4};

getProperty(x, 'a');
getProperty(x, 'm');
```

## 交叉类型 (Intersection Types)

**交叉类型是将多个类型合并成一个类型，这样合并后的类型可以使用所有类型的特性。**

```typescript
function extend<T, U>(first: T, second: U): T & U {
  let result = {} as T & U;

  for (let id in first) {
    result[id] = first[id] as any;
  }

  for (let id in second) {
    if (!result.hasOwnProperty(id)) {
      result[id] = second[id] as any;
    }
  }
  return result;
}

class Person {
  public constructor(public name: string) {
    this.name = name;
  }
}

interface Loggable {
  log(): void 
}

class ConsoleLogger implements Loggable {
  log() {}
}

var jim = extend(new Person('jim'), new ConsoleLogger());

jim.name;
jim.log();
```

### 类型别名

类型别名会给一个类型起一个新名字（比如string类型可以取其他东西来替代，这个替代者就是类型别名 **类型别名** ），类型别名有时和接口很像，但是作用于原始值，联合类型，元祖以及其它任何你需要手写的类型。

```typescript
type Name = 'string';
type NameResolver = () => string;
type NameOrResolver = Name | NameResolver;
function getName(n: NameOrResolver): Name {
  if (typeof n === 'string') {
    return n;
  } else {
    return n();
  }
```
起别名不会新建一个类型，它创建一个新名字来引用那个类型，给原始类型起别名通常没什么用，尽管可以作为文档的一种形式使用。


### 接口和类型别名

* 接口创建一个新的名字，可以在其它任何地方使用。类型别多并不创建新名字 错误信息不会用在别名上。
* 另一个重要区别是类型别名不能被 extends 和 implements，**软件中的对象应该对于扩展是开放的，但是对于修改是封闭** 尽量使用接口来替代别名
* 如果无法使用接口来描述一个类型 并且需要使用联合类型或者元祖类型 这时通常会使用类型别名

## 字符串字面量类型
字符串字面量允许指定字符串必须的固定值，在实际应用中，字符串字面量类型可以与联合类型，类型保护和类型别名很好的配合。



## 枚举
枚举（Enum）类型用于取值被限定在一定范围内的场景，比如一周只能有7天，颜色限定为红绿蓝等。

```typescript
enum Days { Sun, Mon, Tue, Wed, Thu, Fir, Sat };
// 初始值为0 其余的成员会从0开始自动增长

Days['Sun'] = 0;
Days[0] = 'Sun';
```


