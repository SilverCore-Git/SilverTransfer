<script setup lang="ts">
import Footer from './components/Footer.vue';
import StatsClient from './assets/stats';
import { onMounted } from 'vue';

const stats = new StatsClient();

onMounted(async () => {

  // verify session
  const verify = await stats.verify_session();

  if (!verify || verify.error) {
    // create new session
    await stats.create_session("temp");
  }

  // send stats
  await stats.send();

  const close = () => {
    const url = "https://www.silvertransfert.fr/session/close";

    navigator.sendBeacon(url);
  };

  window.addEventListener("beforeunload", close);
  window.addEventListener("unload", close);

});

</script>

<template>
  <router-view></router-view>

  <footer>
    <Footer />
  </footer>
</template>
