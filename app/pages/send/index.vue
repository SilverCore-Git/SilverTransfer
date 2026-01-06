<template>

    <div
        class="absolute inset-0 flex justify-center items-center"
    >

        <Card
            title="Envoie du fichier..."
            class="-translate-y-10"
        >
            <!-- State: Ready -->
            <div v-if="state === 'ready'" class="w-full space-y-4">
                <p class="text-gray-400">
                    Fichier à envoyer: <span class="font-semibold text-white">{{ files[0]?.name }}</span>
                </p>
                <button
                    @click="handleSend"
                    class="w-full px-4 py-2 bg-primary rounded-lg font-semibold hover:bg-primary/90 transition"
                    :disabled="!files[0] || isLoading"
                >
                    {{ isLoading ? "Envoi en cours..." : "Envoyer le fichier" }}
                </button>
            </div>

            <!-- State: Uploading -->
            <div v-if="state === 'uploading'" class="w-full space-y-4">
                <div class="space-y-2">
                    <p class="text-gray-400">Progression du téléversement</p>
                    <div class="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                            class="bg-primary h-full transition-all duration-300"
                            :style="{ width: `${percent}%` }"
                        ></div>
                    </div>
                    <p class="text-right text-sm font-semibold">{{ percent }}%</p>
                </div>
            </div>

            <!-- State: Success -->
            <div v-if="state === 'success'" class="w-full space-y-4">
                <p class="text-green-400 font-semibold">✓ Téléversement terminé !</p>
                <div class="space-y-2">
                    <p class="text-gray-400 text-sm">Lien de téléchargement:</p>
                    <div class="bg-gray-700 rounded-lg p-3 break-all">
                        <a
                            :href="downloadLink"
                            target="_blank"
                            class="text-primary hover:underline"
                        >
                            {{ downloadLink }}
                        </a>
                    </div>
                </div>
                <button
                    @click="handleReset"
                    class="w-full px-4 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition"
                >
                    Envoyer d'autres fichiers
                </button>
            </div>

            <!-- State: Error -->
            <div v-if="state === 'error'" class="w-full space-y-4">
                <p class="text-red-400 font-semibold">✗ Erreur lors du téléversement</p>
                <p class="text-gray-400 text-sm">{{ errorMessage }}</p>
                <button
                    @click="handleReset"
                    class="w-full px-4 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition"
                >
                    Réessayer
                </button>
            </div>

        </Card>

    </div>

</template>

<script lang="ts" setup>

import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import files from '~/assets/ts/Files';
import sendFiles from '~/assets/ts/SendFile';

const route = useRoute();
const percent = ref<number>(0);
const state = ref<'ready' | 'uploading' | 'success' | 'error'>('ready');
const isLoading = ref<boolean>(false);
const downloadLink = ref<string>('');
const errorMessage = ref<string>('');


const handleSend = async () => {

    if (files.value.length === 0) {
        errorMessage.value = 'Aucun fichier sélectionné';
        state.value = 'error';
        return;
    }

    isLoading.value = true;
    state.value = 'uploading';
    percent.value = 0;

    const idAndPasswd = crypto.randomUUID();
    const [part1, ...rest] = idAndPasswd.split('-')
    const id = `${part1}-${rest[0]}`
    const passwd = rest.slice(1).join('-')

    try {

        await sendFiles(id, passwd, {
            onProgress: (progress) => {
                percent.value = progress;
            },
            onComplete: (response) => {
                downloadLink.value = response.downloadPath;
                state.value = 'success';
                isLoading.value = false;
            },
            onError: (error) => {
                errorMessage.value = error.message;
                state.value = 'error';
                isLoading.value = false;
            }
        });
    } catch (err) {
        errorMessage.value = err instanceof Error ? err.message : 'Erreur inconnue';
        state.value = 'error';
        isLoading.value = false;
    }
};

const handleReset = () => {
    percent.value = 0;
    state.value = 'ready';
    downloadLink.value = '';
    errorMessage.value = '';
    files.value = [];
};

</script>