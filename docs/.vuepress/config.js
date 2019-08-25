/*
 * @Author: shiyao
 * @Description: 
 * @Date: 2019-08-19 10:07:26
 * @param: 
 * @return: 
 */
module.exports = {
  title: 'MVVM框架集',
  base: '/MVVMDoc/', // 设置站点根目录
  description: '飘飘乎如遗世独立 羽化而登仙',
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/pkq.jpeg'
      } 
    ]
  ],
  themeConfig: {
    editLinkText: '在 GitHub 上编辑此页',
    nav: [
      { 
        text: 'Vue',
        items: [
          {
            text: 'Vue基础知识',
            link: '/MVVM/Vue/basic/'
          },
          {
            text: 'Vue全局设计',
            link: '/MVVM/Vue/global/'
          },
          {
            text: 'Vue组件开发',
            link: '/MVVM/Vue/components/'
          },
          {
            text: 'Vue-router路由',
            link: '/MVVM/Vue/router/'
          }
        ]
      },
      { 
        text: 'React',
        items: [
          {
            text: 'React',
            link: '/MVVM/React/basic/'
          },
          {
            text: 'react-router',
            link: '/MVVM/React/Router/'
          },
          {
            text: 'Redux',
            link: '/MVVM/React/Redux/'
          }
        ]
      },
      { 
        text: '组件原理',
        items: [
          {
            text: '组件开发',
            link: '/MVVM/Components/'
          }
        ]
      },
      { 
        text: 'TypeScript',
        items: [
          {
            text: 'TypeScript',
            link: '/MVVM/TSC/typescript/'
          },
          {
            text: 'TypeScript封装一个Axios',
            link: '/MVVM/TSC/Axios/'
          }
        ]
      },
    ],
    sidebar: {
      '/MVVM/Vue/basic/': [
        {
          title: 'Vue源码',
          collapsable: false,
          children: [
            '/MVVM/Vue/basic/',
            '/MVVM/Vue/basic/newvue.md',
            '/MVVM/Vue/basic/init.md',
            '/MVVM/Vue/basic/reactive.md',
            '/MVVM/Vue/basic/observe.md',
            '/MVVM/Vue/basic/initProps.md',
            '/MVVM/Vue/basic/parse.md'
          ]
        }
      ],
      '/MVVM/Vue/router/': [
        {
          title: 'router',
          collapsable: false,
          children: [
            '/MVVM/Vue/router/',
            '/MVVM/Vue/router/install.md'
          ]
        }
      ],
      '/MVVM/React/Redux/': [
        {
          title: 'Redux',
          collapsable: false,
          children: [
            '/MVVM/React/Redux/',
            '/MVVM/React/Redux/Introduction.md'
          ]
        }
      ],
      '/MVVM/Components/': [
        {
          title: '组件原理',
          collapsable: false,
          children: [
            '/MVVM/Components/'
          ]
        }
      ],
      '/MVVM/Vue/global/': [
        {
          title: 'Vue全局设计',
          collapsable: false,
          children: [
            '/MVVM/Vue/global/',
            '/MVVM/Vue/global/util.md'
          ]
        }
      ],
      '/MVVM/Vue/components/': [
        {
          title: 'Vue组件设计',
          collapsable: false,
          children: [
            '/MVVM/Vue/components/',
          ]
        }
      ],
      '/MVVM/Vue/Code/': [
        {
          title: 'Vue源码',
          collapsable: false,
          children: [
            '/MVVM/Vue/Code/',
            '/MVVM/Vue/Code/New'
          ]
        }
      ],
      '/MVVM/React/basic/': [
        {
          title: 'React相关知识',
          collapsable: false,
          children: [
            '/MVVM/React/basic/',
            '/MVVM/React/basic/basic.md',
            '/MVVM/React/basic/Advance.md'
          ]
        }
      ],
      '/MVVM/React/Router/': [
        {
          title: 'Router相关',
          collapsable: false,
          children: [
            '/MVVM/React/Router/'
          ]
        }
      ],
      '/MVVM/SourceCode/': [
        {
          title: '源码相关',
          collapsable: false,
          children: [
            '/MVVM/SourceCode/'
          ]
        }
      ],
      '/MVVM/Vue/utils/': [
        {
          title: '工具函数',
          collapsable: false,
          children: [
            '/MVVM/Vue/utils/',
            '/MVVM/Vue/utils/shared.md'
          ]
        }
      ],
      '/MVVM/TSC/typescript/': [
        {
          title: 'TypeScript',
          collapsable: false,
          children: [
            '/MVVM/TSC/typescript/'
          ]
        }
      ],
      '/MVVM/TSC/Axios/': [
        {
          title: 'typescript封装axios',
          collapsable: false,
          children: [
            '/MVVM/TSC/Axios/',
            '/MVVM/TSC/Axios/start.md'
          ]
        }
      ]
    },
    repo: 'facebook201/MVVMDoc', // github 地址
    docsRepo: 'facebook201/MVVMDoc',
    docsDir: 'docs',
    editLinks: true
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@public': './public'
      }
    }
  }
};







