<script setup lang="ts">
import Card from '~/components/card.vue';



</script>

<template>

  <div
    class="absolute inset-0 flex justify-center items-center"
  >

    <Card
      title="Choissisez votre fichier"
      btn="Envoyer"
      class="-translate-y-10"
      @btn-click="navigateTo('/upload')"
    >



    </Card>

  </div>

</template>
