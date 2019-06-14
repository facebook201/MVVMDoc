export default {

  /**
   * 
   */
  silent: false,
  
  ignoredElements: [],

  getTagNamespace: noop,

  async: true
};

/**
 * initMixin
 * Vue 构造函数初始化
 */

 let uid = 0;

export function initMixin (Vue) {
  Vue.prototype._init = function(options) {
    const vm = this;
    vm._uid = uid++;
    // 标识这个对象 vm 是一个Vue实例，告诉响应式系统不要被观测。
    vm._isVue = true;

    if (options && options._isComponent) {
      initInternalComponent(vm, options);
    } else {
      // 给vm 添加一个$options 属性，这个属性在后面会被大量的用到
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm);
    } else {
      vm._renderProxy = vm;
    }

    vm._self = vm;
    initLifeCycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, 'beforeCreate');
    initInjections(vm);

    initState(vm);
    initProvide(vm);
    callHook(vm, 'created');

    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  }
}

// 解析构造函数的options
export function resolveConstructorOptions(Ctor) {
  let options = Ctor.options;
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super);
    const cachedSuperOptions = Ctor.superOptions;
    if (superOptions !== cachedSuperOptions) {
      
      Ctor.superOptions = superOptions;
    }
  }
}




// initMixin(Vue) core/instance/init.js
Vue.prototype._init = function(options?: Object) {}

// stateMixin(Vue) core/instance/state.js
Vue.prototype.$data




export function makeMap (
  str: string,
  expectsLowerCase?: Boolean
) {
  const map = Object.create(null);
  const list: Array<string> = str.split(',');

  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val];
}

