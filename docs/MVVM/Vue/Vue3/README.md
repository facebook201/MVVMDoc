# Composition API 组合式API



* 更好的逻辑复用与代码阻止

* 更好的类型推导

  

## API 介绍



### 响应式状态与副作用 reactive watchEffect



```javascript
import { reactive } from 'vue';

const state = reactive({
  count: 0
});
```



#### watchEffect 

 接收一个应用预期副作用的函数，会立即执行该函数。并将该执行过程中用到的所有响应式状态的property 作为依赖进行追踪。



### 计算状态 Ref



## setup





