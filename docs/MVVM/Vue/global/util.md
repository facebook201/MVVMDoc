
# util工具方法


## lang.js代码

### isReserved 检查是否是保留键名
在Vue里面 不允许使用 $ 或 _ 开头的字符串作为data数据的字段名。
```javascript
export function isReserved (str: string): boolean {
  const c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F;
}
```
$的unicode码是36，_是95，这里作者使用者两个十六进制的值比unicode更快。
