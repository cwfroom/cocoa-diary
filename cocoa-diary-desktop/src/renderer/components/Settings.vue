<template>
    <div id='settings-container'>
        <md-field>
            <label>Local Path</label>
            <md-input v-model="localPath"></md-input>
        </md-field>
        <md-field>
            <label>First Year</label>
            <md-input v-model="firstYear"></md-input>
        </md-field>
        <md-button class="md-raised md-primary" @click="confirmSettings">Confirm</md-button>
    </div>
</template>

<script>
export default {
    name: 'settings',
    data: () => ({
        localPath: '',
        firstYear: 0
    }),
    created: function () {
        this.$data.localPath = this.$store.state.localPath
        this.$data.firstYear = this.$store.state.firstYear
    },
    watch: {
        localPath: function (newval, oldVal) {
            this.$store.commit('setLocalPath', newval)
        },
        firstYear: function (newVal, oldVal) {
            this.$store.commit('setFirstYear', newVal)
        }
    },
    methods: {
        confirmSettings () {

        }
    }
}
</script>

<style>
    #settings-container {
        max-width: 450px;
        margin: auto;
    }
</style>
