import Vue from 'vue'
import Vuex from 'vuex'

import { createPersistedState } from 'vuex-electron'
import { remote } from 'electron'

import modules from './modules'

Vue.use(Vuex)

const getDefaultState = () => {
  const currentTime = new Date();
  currentTime.getFullYear()
  const defaultPath = remote.app.getPath('documents') + '\\Diary'
  return {
    initialized: false,
    showSettings: true,
    localPath: defaultPath,
    firstYear: currentTime.getFullYear(),
    remoteAddr: 'http://127.0.0.1:2638',
    remotePass: ''
  }
}

const state = getDefaultState()

export default new Vuex.Store({
  modules,
  plugins: [
    createPersistedState()
  ],
  state,
  mutations: {
    resetState (state) {
      Object.assign(state, getDefaultState())
    },
    setShowSettings (state, value) {
      if (!state.initialized) state.initialized = true
      state.showSettings = value
    },
    setLocalPath (state, path) {
      state.localPath = path
    },
    setFirstYear (state, year) {
      state.firstYear = parseInt(year)
    }
  },
  strict: process.env.NODE_ENV !== 'production'
})
