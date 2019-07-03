
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
            test: 'Vue的模板AST详解',
            link: '/MVVM/Vue/AST/'
          }
        ]
      },
      { 
        text: 'React',
        items: [
          {
            text: 'React基础知识',
            link: '/MVVM/React/basic/'
          }
        ]
      },
      { 
        text: '源码相关',
        items: [
          {
            text: '源码相关',
            link: '/MVVM/SourceCode/'
          }
        ]
      },
      { 
        text: 'TypeScript',
        items: [
          {
            text: 'TypeScript',
            link: '/MVVM/TSC/'
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
            '/MVVM/React/basic/'
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
      '/MVVM/TSC/': [
        {
          title: 'TypeScript',
          collapsable: false,
          children: [
            '/MVVM/TSC/'
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




