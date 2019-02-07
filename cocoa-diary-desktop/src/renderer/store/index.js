import Vue from 'vue'
import Vuex from 'vuex'

import { createPersistedState, createSharedMutations } from 'vuex-electron'

import modules from './modules'

Vue.use(Vuex)

const getDefaultState = () => {
  return {
    localPath: '',
    firstYear: 0,
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
    setLocalPath (state, path) {
      state.localPath = path
    },
    setFirstYear (state, year) {
      state.firstYear = parseInt(year)
    }
  },
  strict: process.env.NODE_ENV !== 'production'
})
