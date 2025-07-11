<template>

    <div class="relative h-screen w-full">

        <div class="flex items-center justify-center flex-col h-full w-full min-w-[300px]">

            <div class="card">

                <h1 class="flex flex-col gap-2">

                    <span class="title">SilverTransfert</span>
                    <div class="text-2xl font-medium">{{ statusMessage }}</div>
                    <span class="text-lg font-normal">{{ timeLeft }}</span>

                </h1>

                <div class="my-15 w-full flex flex-col justify-center items-center">

                    <h2 class="text-4xl font-bold mb-4">{{ value }}%</h2>

                    <progress
                        v-if="!ending_bar"
                        :value="value"
                        max="100"
                        class="progress-bar w-[90%] h-2 rounded-full overflow-hidden"
                    ></progress>

                    <div v-if="ending_bar" class="loader-end"></div>

                </div>

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

        </div>

    </div>

</template>

<script setup lang="ts">

import { ref } from 'vue'

const ending_bar = ref<boolean>(false);
const statusMessage = ref('Téléversement en cours...')
const timeLeft = ref('0mn 0s restants')

const props = defineProps<{
    value: number;
}>()

const interval = setInterval(() => {

    if (props.value < 100) {
        const secondsLeft = (100 - props.value) * 0.5
        const minutes = Math.floor(secondsLeft / 60)
        const seconds = Math.floor(secondsLeft % 60)
        timeLeft.value = `${minutes}mn ${seconds}s restants`
    } else {
        statusMessage.value = 'Téléversement terminé !'
        clearInterval(interval)
        ending_bar.value = true
    }

}, 200)

</script>

<style scoped>


.loader-end {
  width: 90%;
  height: 10px;
  border-radius: 30px;
  background-color: #e5e7eb;
  position: relative;
}

.loader-end::before {
  content: "";
  position: absolute;
  background: var(--linear);
  top: 0;
  left: 0;
  width: 0%;
  height: 100%;
  border-radius: 30px;
  animation: moving 1s ease-in-out infinite;
}

@keyframes moving {
  50% {
    width: 100%;
  }
  100% {
    width: 0;
    right: 0;
    left: unset;
  }
}

</style>
