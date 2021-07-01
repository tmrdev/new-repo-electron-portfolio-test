<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" width="25">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ffffff;
  margin-top: 10px;
}
/* 
 * Use media declarations below for macOS native dark and light themes 
 */
@media (prefers-color-scheme: dark) {
  body { background: #2c3e50; color: white; }
}

@media (prefers-color-scheme: light) {
  body { background: #ddd; color: black; }
}

</style>
