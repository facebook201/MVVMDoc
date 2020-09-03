# vite


## 什么是Vite?

**Vite是一个由原生 ESM 驱动的Web开发构建工具。在开发环境下基于浏览器原生ES imports开发，在生产环境下基于Rollup打包**

## 特点

* 快速的冷启动
* 即时的模块热更新
* 真正的按需编译
* 没有跟Vue强绑定、可以支持Preact、React

## 原理

* Webpack 打包工具为了在浏览器里面加载模块，所以使用webpack_require方法来获取模块导出，vite利用了浏览器原生支持模块化导入特性，不需要生成bundle，所以**冷启动是非常快的**
* webpack 打包是静态的，导致如果项目越来越大 打包的bundle也会也越来越打。**ESM天生是按需加载，只有import的时候才去按需加载**
* 原生的ESModule 只能在 HTTP（S）、不能在本地local files下工作。



## 插知识 现代浏览器模块

>一个模块就是一个文件，一个脚本就是一个模块。模块可以相互加载，可以使用特殊指令 export 和 import 来交换功能。
>
>* export 关键字标记了可以从当前模块外部访问的变量和函数
>* import 允许从其他模块导入功能



## Vue3和2的区别



* 2是 option API，3是 composition API（实现高内聚，通过函数来实现）



























