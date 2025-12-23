<script setup lang="ts">
import Card from '~/components/card.vue';
import FileDrop from '~/components/FileDrop.vue';



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

      <FileDrop />

    </Card>

  </div>

</template>
