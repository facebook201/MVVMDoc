<template>
  <div
    class="theme-container"
    :class="pageClasses">
    <!-- @touchstart="onTouchStart"
    @touchend="onTouchEnd"> -->
    <Navbar v-if="shouldShowNavbar" @toggle-sidebar="toggleSidebar"/>

    <div class="sidebar-mask" @click="toggleSidebar(false)"></div>

    <!-- 侧边栏 -->
    <Sidebar :items="sidebarItems" @toggle-sidebar="toggleSidebar">
      <div slot="top" :class="{'load-success':loadSuccess}">
        <div id="codefund" :key="$route.path"></div>
        <!-- 这里可以加点广告 图片之类的东西 -->
      </div>
      <slot name="sidebar-bottom" slot="bottom"/>
    </Sidebar>

    <div class="custom-layout" v-if="$page.frontmatter.layout">
      <component :is="$page.frontmatter.layout"/>
    </div>

    <Home v-else-if="$page.frontmatter.home"/>

    <Page v-else :sidebar-items="sidebarItems">
      <slot name="page-top" slot="top"/>
      <slot name="page-bottom" slot="bottom"/>
    </Page>

  </div>
</template>

<script>
import Home from './Home.vue';
import Navbar from '@default-theme/Navbar.vue'
import Page from '@default-theme/Page.vue'
import Sidebar from '@default-theme/Sidebar.vue'
import { resolveSidebarItems } from '@default-theme/util'

export default {
  components: { Home, Navbar, Page, Sidebar },

  data() {
    return {
      isSidebarOpen: false,
      swUpdateEvent: null,
      loadSuccess: true
    };
  },

  computed: {
    shouldShowSidebar() {
      const { frontmatter } = this.$page
      return (
        !frontmatter.layout &&
        !frontmatter.home &&
        frontmatter.sidebar !== false &&
        this.sidebarItems.length
      )
    },
    shouldShowNavbar() {
      const { themeConfig } = this.$site
      const { frontmatter } = this.$page
      if (frontmatter.navbar === false || themeConfig.navbar === false) {
        return false
      }
      return (
        this.$title ||
        themeConfig.logo ||
        themeConfig.repo ||
        themeConfig.nav ||
        this.$themeLocaleConfig.nav
      )
    },
    sidebarItems() {
      return resolveSidebarItems(
        this.$page,
        this.$route,
        this.$site,
        this.$localePath
      )
    },
    pageClasses() {
      const userPageClass = this.$page.frontmatter.pageClass;
      return [
        {
          'no-navbar': !this.shouldShowNavbar,
          'sidebar-open': this.isSidebarOpen,
          'no-sidebar': !this.shouldShowSidebar
        },
        userPageClass
      ]
    }
  },

  mounted() {
  },

  methods: {
    // 切换侧边栏
    toggleSidebar(to) {
      this.isSidebarOpen = typeof to === 'boolean' ? to : !this.isSidebarOpen;
    }
  }
};
</script>

<style src="prismjs/themes/prism-tomorrow.css"></style>
<style src="@default-theme/styles/theme.styl" lang="stylus"></style>

<style>
.cf-wrapper a {
  display: block;
}
.sidebar .sidebar-links {
  padding-top: 10px;
}
</style>
