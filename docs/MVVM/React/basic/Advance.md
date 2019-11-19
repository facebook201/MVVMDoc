# React 高级部分

## JSX
JSX本质上来说只是为 React.createElement(Component, props, ...children)方法提供的语法糖。
更详细的可以看这里 [createElement](https://cn.vuejs.org/v2/guide/render-function.html#%E8%99%9A%E6%8B%9F-DOM)

```jsx
<div color="blue">
  Click Me
</div>

// 编译成
React.createElement('div', {
  color: 'blue'
}, 'Click Me');
```

### React元素类型
大写开头的JSX标签标示一个React组件，这些标签会编译为同名变量并被引用。所以引用之前要先声明Foo变量，

```jsx
import React from 'react';
import CustomButton from './CustomButton';

function WarningButton() {
  // 返回 React.createElement(CustomButton, {color: 'red'}, null);
  return <CustomButton color="red" />;
}
```





## PropTypes 类型检查
React 内置了一些类型检查的功能，在组件的props上进行类型检查。只要配置 propTypes 属性:

```javascript
import PropTypes from 'prop-types';

class Greeting extends React.Component {
  render() {
    return ();
  }
};

Greeting.propTypes = {
  name: PropTypes.string
};
```


