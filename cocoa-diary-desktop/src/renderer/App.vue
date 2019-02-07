<template>
  <div id="app">
    <md-app>
      <md-app-toolbar class="md-primary">
        <span class="md-title">Settings</span>
      </md-app-toolbar>
      <md-app-content>
        <settings></settings>
      </md-app-content>
    </md-app>
    
  </div>
</template>

<script>
  import Settings from '@/components/Settings'

  export default {
    name: 'cocoa-diary-desktop',
    components: {
      Settings
    }
  }
</script>

<style>
  /* CSS */
</style>
