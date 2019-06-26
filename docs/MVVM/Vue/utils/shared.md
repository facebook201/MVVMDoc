# shared/util 工具方法


## emptyObject


## isUndef
```javascript
export function isUndef(v) {
  return v === undefined || v === null;
}
```
判断给定变量是否是未定义，当变量为null，也会认为其是未定义。

## isDef 
```javascript
export function isUndef(v) {
  return v !== undefined && v !== null;
}
```
判断给定变量是否定义，当变量为null，也会认为其是未定义。


## isPrimitive
```javascript
export function isPrimitive(v) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}
```
判断给定的变量是否是原始类型的值。