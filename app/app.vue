<script setup>
import Footer from './components/app/footer.vue';
import Header from './components/app/header.vue';

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'fr'
  }
})

const title = 'SilverTransfert'
const description = 'Transfert de fichiers sécurisé et rapide'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})

</script>

<template>

  <div 
    id="inerApp" 
    class="
      min-h-screen
      background text-white
    "
  >
    
    <Header />

    <main class="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
      <NuxtPage />
    </main>

    <Footer />

  </div>

</template>

<style>

.background {
  @apply bg-bg;
  background-image:
    radial-gradient(2px 2px at 20px 30px, white, transparent),
    radial-gradient(1.5px 1.5px at 80px 120px, white, transparent),
    radial-gradient(2px 2px at 200px 50px, white, transparent),
    radial-gradient(1.5px 1.5px at 300px 100px, white, transparent),
    radial-gradient(1.8px 1.8px at 150px 200px, white, transparent);
  background-size: 400px 400px;
}

</style>