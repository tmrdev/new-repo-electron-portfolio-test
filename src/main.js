import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import TwitterFeed from "vuejs-twitter-feed";
Vue.use(TwitterFeed);

new Vue({
  render: h => h(App),
}).$mount('#app')
