<template>

    <section  class="flex flex-col items-center justify-center min-h-screen text-white">

        <div class="card bg-gray-800 rounded-xl p-6 w-full max-w-xl text-center">

            <a href="/">
                <h1 class="title notranslate">SilverTransfert</h1>
            </a>

            <h2 class="text-2xl ">Téléversement terminé !</h2>

            <div class="flex flex-col justify-center items-center my-10 w-full text-left">

                <label class="block mb-1">Lien de téléchargement :</label>

                <input
                    v-model="downloadLink"
                    type="url"
                    id="linkInput"
                    placeholder="Tu m'as trouvé gg !!"
                    required
                     class="w-[90%] px-3 py-2 mb-3 rounded-full text-base outline-none text-white bg-[rgba(0,0,0,0.2)] border border-[#6a11cb] "
                />

                <button class="primary" @click="copyLink">
                    <i :class="copied ? 'bi bi-check' : ''"></i> {{ copied ? 'Copié !' : 'Copier le lien' }}
                </button>

            </div>

            <a href="/"><button class="second mb-6" >
                <span class=" font-bold text-xl">refaire un transfert</span>
            </button></a>

            <div class="flex flex-row gap-3 font-bold text-lg">
                <span>Un problème ?</span>
                <a
                    href="https://discord.gg/mKs3uMTJWM"
                    target="_blank"
                    class="underline"
                    >Discord - support</a
                >
            </div>

        </div>

        <Social_contaner />

    </section>

</template>

<script setup lang="ts">

import { ref } from 'vue'
import { useRoute } from 'vue-router';

import Social_contaner from './Social_contaner.vue'

const route = useRoute();

const props = defineProps<{
    data: {
        id: number;
        passwd: string
    }
}>()

const downloadLink = ref<string>('') 
const copied = ref(false)

if (route.query.link == '1') {
    downloadLink.value = window.location.origin + '/t/' + route.query.id + '/' + route.query.passwd;
} else {
    downloadLink.value = window.location.origin + '/t/' + props.data.id + '/' + props.data.passwd;
}

function copyLink() {
  navigator.clipboard.writeText(downloadLink.value).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}
</script>

