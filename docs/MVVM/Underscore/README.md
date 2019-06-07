# UnderScore

## 如何实现自己的underscore

如何组织像underscore一样来管理这么多的功能函数。
首先是要考虑到多个环境，浏览器、Node端、Web Worker、微信小程序等。

```javascript
var root = (typeof self == 'object' && self.self == self && self) ||
           (typeof global == 'object' && global.global == global && global) ||
           this ||
           {};
```

### 函数对象
underscore把方法都挂在了一个_上，它可以支持函数调用，也可以支持面向对象调用
```javascript
// 函数调用
_.reverse('hello');

// 面向对象
_('hello').reverse();
```


