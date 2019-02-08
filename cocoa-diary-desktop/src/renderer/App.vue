<template>
  <div id="app">
      <editor v-show=!($store.state.showSettings)></editor>
      <settings v-show=$store.state.showSettings></settings>
  </div>
</template>

<script>
  import Editor from '@/components/Editor'
  import Settings from '@/components/Settings'

  export default {
    name: 'cocoa-diary-desktop',
    components: {
      Editor,
      Settings
    },
    data : () => ({
      title: 'Settings'
    })
  }
</script>

<style>
  /* CSS */
</style>
