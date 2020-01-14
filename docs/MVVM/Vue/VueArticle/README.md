# 前端好文

## 前端虚拟列表的实现

### 实现思路

[来自知乎Furybean](https://www.zhihu.com/people/frank-zhang/activities)

DOM元素的创建和渲染需要的时间成本很高，在大数据的情况下，完整渲染列表所需要的时间不可接收。其中一个解决思路就是在任何情况下只对「**可见区域** 」渲染，初次可以到达很高的渲染性能。下面是虚拟列表的两个概念


* 可滚动区域: 假设有1000条数据，每个列表项的高度是30，那么可滚动的区域的高度是 1000 * 30。当用户改变列表的滚动条的当前滚动值的时候，会造成可见区域的内容的变。
* 可见区域：比如列表高度是 300，右侧有纵向滚动条可以滚动，视觉可见的区域就是可见区域。


实现虚拟列表就是处理滚动条滚动后的可见区域的变更

* 1、计算当前可见区域起始数据的 startIndex
* 2、计算当前可见区域结束数据的 endIndex
* 3、计算当前可见区域的数据、并渲染到页面中
* 4、计算starIndex对应数据在整个列表中的偏移位置 startOffset, 设置到列表上

![border](https://pic3.zhimg.com/80/v2-f00bb3f5d9815d660d7bcbd87236af86_hd.jpg)

```vue
  computed: {
    contentHeight() {
      return this.data.length * this.itemHeight + 'px';
    }
  },
    handleScroll() {
      const scrollTop = this.$el.scrollTop;
      this.updateVisibleData(scrollTop);
    },
    updateVisibleData(scrollTop = 0) {
      const visibleCount = Math.ceil(this.$el.clientHeight / this.itemHeight);
      const start = Math.floor(scrollTop / this.itemHeight);
      const end = start + visibleCount;
      this.visibleData = this.data.slice(start, end);
      this.$refs.content.style.webkitTransform = `translate3d(0, ${start * this.itemHeight}px, 0)`;
    }
```

### 去掉限制

上面的高度属性是定死的。我们可以动态高度来做

* 添加一个数组类型的prop，每个列表项的高度通过索引来获得
* 添加一个获取列表项高度的方法，给这个方法传入item和index、返回对应列表项的高度

第二种方法更好，新增一个 itemSizeGetter 属性 来获取每个列表项的高度。

```vue

props: {
  itemSizeGetter: {
    type: Function
  }
}


computed: {
  // 每行高度不一样 所以 contentHeight 算法要更新。
  contentHeight() {
    const { data, itemSizeGetter } = this;
    let total = 0;

    for (let i = 0, i < data.length; i < j; ++i) {
      // 计算每次的高度 最后加起来返回
      total += itemSizeGetter.call(null, data[i], i);
    }
    return total;
  }
}
```

