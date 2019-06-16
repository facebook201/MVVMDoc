
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
<<<<<<< HEAD
            text: 'Vue源码',
            link: '/MVVM/Vue/Code/'
=======
            text: 'Vue全局设计',
            link: '/MVVM/Vue/global/'
>>>>>>> ecc6db2599e8ea5f9bc918424168e67e2f008e7c
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
      }
    ],
    sidebar: {
      '/MVVM/Vue/basic/': [
        {
          title: 'Vue源码',
          collapsable: false,
          children: [
            '/MVVM/Vue/basic/',
            '/MVVM/Vue/basic/newvue.md'
          ]
        }
      ],
      '/MVVM/Vue/global/': [
        {
          title: 'Vue全局设计',
          collapsable: false,
          children: [
            '/MVVM/Vue/global/',
            '/MVVM/Vue/global/API.md',
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

