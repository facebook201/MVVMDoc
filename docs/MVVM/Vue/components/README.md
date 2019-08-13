
# 组件设计

## 细粒度的考量
原则上一个组件只做一件事。但是注意单一职责组件要建立在可复用的基础上，不可复用的单一职责组件仅仅作为独立组件的内部组件即可。

## 通用性考量
要考虑到一个组件的各种使用场景，试着将DOM结构的控制权交给开发者，组件只负责行为和最基本的DOM结构。

## typescript 和 代码检测

## commit 规范

* type: commit 的类型
* feat: 新特性
* fix: 修改问题
* refactor: 代码重构
* docs: 文档修改
* style: 代码格式修改, 注意不是 css 修改
* test: 测试用例修改
* chore: 其他修改, 比如构建流程, 依赖管理.
* scope: commit 影响的范围, 比如: route, component, utils, build…
* subject: commit 的概述, 建议符合 50/72 formatting
* body: commit 具体修改内容, 可以分为多行, 建议符合 50/72 formatting
* footer: 一些备注, 通常是 BREAKING CHANGE 或修复的 bug 的链接.

