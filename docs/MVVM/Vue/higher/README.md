

# 进阶知识
## 高性能组件注册
### 怎么注册并调用一个组件

一般注册组件有三个步骤来实现调用组件的一整个流程

* import引入组件
* 在父组件的组件对象components中导入的子组件注册
* 在父组件中使用该组件

这是80%的人开发过程中使用的方式。


### 内置组件component

Vue有提供一个内置组件 component ，渲染一个“元组件”为动态组件。根据 is 的值，来决定哪个组件被渲染。但是大部分时候我们仍然必须先导入并注册才能完成调用。现在，我们就不想提前注册好所需使用的子组件，因为太麻烦了并且浪费性能，想尝试动态导入注册使用。

```vue
<template>
  <div class="container">
    <button @click="isMember = !isMember">{{isMember?'我不想要会员了，哼':'我要成为会员'}}</button>
    <component :is="userComponentImstance" title="component就是好用哟"/>
  </div>
</template>

<script>
export default {
  name: "userImport",
  data() {
    return {
      isMember: false
    };
  },
  computed: {
    userComponentImstance() {
      let { isMember } = this;
      let pathName = isMember ? "MemberInfo" : "UserInfo";
      //通过import动态导入组件 配合webpack实现组件分离
      return () => import(`../components/${pathName}`);
    }
  }
};
</script>
```

这里就不再是前面提前导入组件的形式来调用，is接收两种选项之一:

* **注册的组件名称**
* **组件对象**

现在可以通过动态import的形式导入子组件，配合computed按条件渲染对应的子组件。

改变isMember这个变量就可以实现动态切换组件了。这样做的好处在于，当我们使用动态导入的时候，webpack会将与导入函数匹配的每个文件单独创建一个chunk，也就是我们常说的分包加载，而不会一次性加载全部组件。当前样例并不能看出具体有多大的性能提升，但实际开发中，这个优势会非常明显。

#### 另一个场景是随机展示活动组件

假如有个商城首页有几个活动页，活动模板是根据后端返回顺序依次渲染。可以把随机取得模块列表。然后依次获取加载对应的组件。

```vue
<template>
  <div>
    <component :is="item.imstance" v-for="(item ,i) in componentImstances" :info="item" :key="i"/>
  </div>
</template>

<script>
export default {
  name: 'Home',
  
  computed: {
    componentImstances() {
      const { moduleList } = this;

      return moduleList.map(item => {
        item.instance => () => {
          return new Promise((resolve, reject) => {
            let instance = import('../components/${item.type}');
            instance.then(res => {
              resolve(res);
            });
            instance.catch(e => {
              resolve('Error');
            });
          })
        }
      })
    }
  }
}
</script>
```

