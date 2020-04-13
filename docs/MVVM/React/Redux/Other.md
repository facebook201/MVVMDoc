## Redux 相关

### React-redux

redux的问题，之前使用 redux的时候，组件内部导入 store，使用store.subscribe(() => {}) 注册监听，才能拿到数据。
每个组件都需要导入 store，是很麻烦的，这时候有个专门来管理 store的导入和监听。

**react-redux** 是官方为react 用于配合 react 出的绑定库。可以很方便的从 react组件中读取数据， 向 store 中分发 actions 以此来更新数据。  