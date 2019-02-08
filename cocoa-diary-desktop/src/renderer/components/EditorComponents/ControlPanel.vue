<template>
    <md-button class="md-raised md-primary" @click="showSettings()">Settings</md-button>
</template>

<script>
export default {
    name: 'control-panel',
    methods: {
        showSettings () {
            this.$store.commit('setShowSettings', true)
        }
    }
}
</script>

<style>

</style>
