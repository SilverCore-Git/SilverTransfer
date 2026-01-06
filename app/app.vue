<script setup>
import Footer from './components/general/footer.vue';
import Header from './components/general/header.vue';

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
      min-h-screen text-text
      border-gray bg-bg
      overflow-x-hidden
    "
  >
    
    <Header />

    <main class="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
      <NuxtPage />
    </main>

    <Footer />

  </div>

</template>
