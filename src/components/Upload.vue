<template>

  <section id="upload" class="flex flex-col items-center">

    <div class="card">

        <router-link to="/" >
            <h1 class="title">SilverTransfert</h1>
        </router-link>

        <h2 class="text-2xl font-medium mt-2">Choisissez votre fichier</h2>

        <div class="mt-6">
            <Upload_form @file-selected="file => emit('file', file)" />
        </div>

        <div class="mt-5 mb-3 rounded-md">

            <div
                class="flex items-center text-base font-medium cursor-pointer text-white hover:opacity-80 transition"
                @click="toggleAdvanced"
            >

                <span>Paramètres avancés (optionnel)</span>

                <div
                    class="ml-2 transition-transform duration-200"
                    :class="{ '-rotate-90': showAdvanced }"
                >
                    <i class="bi bi-caret-left-fill"></i>
                </div>

            </div>

            <div
                v-if="showAdvanced"
                class="mt-3 flex flex-col space-y-2 text-sm text-white justify-center items-center"
            >

                <label for="stronger" class="font-semibold">Complexité du chiffrement :</label>

                <input
                    id="stronger"
                    name="stronger"
                    type="number"
                    v-model.number="encryptionStrength"
                    @change="emit('change-stronger', encryptionStrength)"
                    min="10"
                    max="100"
                    class=" px-2 py-1 rounded-md border border-gray-400 bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />

                <p class="text-xs text-gray-300">
                    Sécurité élevée = déchiffrement plus long
                </p>

            </div>

        </div>

        <button class="send-btn my-4" @click="submit(); emit('btn-click')">

            <div class="svg-wrapper-1">
                <div class="svg-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                        fill="currentColor"
                        d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                    />
                    </svg>
                </div>
            </div>
            <span>Envoyer !</span>

        </button>

    </div>

        <Social_contaner />

    </section>

</template>

<script setup lang="ts">

import { ref } from 'vue'
import Social_contaner from './Social_contaner.vue'
import Upload_form from './Upload_form.vue';

const emit = defineEmits<{
  (e: 'btn-click'): void;
  (e: 'file', file: File): void;
  (e: 'change-stronger', value: number): void;
}>();

const file = ref<File | null>(null)
const showAdvanced = ref(false)
const encryptionStrength = ref(10)

function toggleAdvanced() {
  showAdvanced.value = !showAdvanced.value
}

function submit() {
  if (!file.value) return

  const f = file.value
  history.pushState(
    null,
    '',
    `?page=send&file=${encodeURIComponent(f.name)}&file_size=${f.size}&lastM=${f.lastModified}&length=1`
  )
}

</script>

<style scoped>

/* From Uiverse.io by adamgiebl */ 
button {
  font-family: inherit;
  font-size: 20px;
  background: var(--second);
  color: white;
  padding: 0.7em 1em;
  padding-left: 0.9em;
  display: flex;
  align-items: center;
  border: none;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: 0 0 20px var(--second);
}

button span {
  display: block;
  margin-left: 0.3em;
  transition: all 0.3s ease-in-out;
}

button svg {
  display: block;
  transform-origin: center center;
  transition: transform 0.3s ease-in-out;
}

button:hover .svg-wrapper {
  animation: fly-1 0.6s ease-in-out infinite alternate;
}

button:hover svg {
  transform: translateX(1.3em) rotate(45deg) scale(1.1);
}

button:hover span {
  transform: translateX(6em);
}

button:active {
  transform: scale(0.95);
}

@keyframes fly-1 {
  from {
    transform: translateY(0.1em);
  }

  to {
    transform: translateY(-0.1em);
  }
}


</style>