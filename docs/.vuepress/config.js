
module.exports = {
  title: '皮卡丘的MVVM框架',
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
            link: '/MVVM/Vue/Basics/'
          }
        ]
      },
      { 
        text: 'React',
        link: '/MVVM/React'
      }
    ],
    sidebar: {
      '/MVVM/Vue/Basics/': [
        {
          title: 'Vue相关知识',
          collapsable: false,
          children: [
            '/MVVM/Vue/Basics/'
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

