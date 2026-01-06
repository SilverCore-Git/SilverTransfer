<script setup lang="ts">
import Card from '~/components/card.vue';
import FileDrop from '~/components/FileDrop.vue';
import files from '~/assets/ts/Files';

</script>

<template>

    <div
        class="fixed inset-0 flex justify-center items-center h-screen bg-bg"
    >

        <Card
            title="Choissisez votre fichier"
            btn="Envoyer"
            class="-translate-y-10"
            @btn-click="files.length > 0 ? navigateTo('/send') : console.log('')"
        >

            <FileDrop />

        </Card>

    </div>

</template>
