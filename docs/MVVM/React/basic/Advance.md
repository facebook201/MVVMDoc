# React 高级部分

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


