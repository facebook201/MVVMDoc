# core/utils工具方法



## env.js

### hasProto
源码如下：
```javascript
export function hasProto= '__ptoto__' in {};
```
* 判断当前环境是否可以使用 __proto__ 属性，在IE11+ 以上才支持。