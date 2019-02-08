<template>
    <md-app>
        <md-app-toolbar class="md-primary">
            <span class="md-title">Settings</span>
        </md-app-toolbar>
        <md-app-content>
            <div id='settings-container'>
                <md-field>
                    <label>Local Path</label>
                    <md-input v-model="localPath"></md-input>
                </md-field>
                <md-button class="md-raised md-primary" @click="$refs.browseDirectory.click()">Browse</md-button>
                <input type="file" ref="browseDirectory" webkitdirectory directory multiple @change="onSelectDirectory()" style="display: none"/>
                <md-field>
                    <label>First Year</label>
                    <md-input type="number" v-model="firstYear"></md-input>
                </md-field>
                <md-button class="md-raised md-primary" @click="confirmSettings()">Confirm</md-button>
                <md-button class="md-raised md-primary" @click="defaultSettings()">Default</md-button>
            </div>
        </md-app-content>
    </md-app>
</template>

<script>
export default {
    name: 'settings',
    data: () => ({
        localPath: '',
        firstYear: 0
    }),
    mounted: function () {
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
            this.$store.commit('setShowSettings', false)
        },
        defaultSettings () {
            this.$store.commit('resetState')
            this.$data.localPath = this.$store.state.localPath
            this.$data.firstYear = this.$store.state.firstYear
        },
        onSelectDirectory () {
            const selected = this.$refs.browseDirectory.files
            if (selected.length > 0){
                this.$data.localPath = selected[0].path
            }
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
