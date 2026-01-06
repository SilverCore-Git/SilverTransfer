<template>

    <label

        class="
            relative w-full
            border-2 border-dashed border-primary/40
            rounded-2xl p-8
            flex flex-col items-center justify-center gap-3
            text-center cursor-pointer
            transition-all duration-200
            bg-bg3

            hover:border-primary
            hover:bg-primary/5
        "
        :class="{
            'border-primary bg-primary/10': isDragging
        }"

        @dragenter.prevent="onDragEnter"
        @dragover.prevent
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"

    >

        <input
            type="file"
            class="hidden"
            @change="onFileSelect"
        />

        <i class="bi bi-upload text-2xl text-primary" />

        <p class="text-base font-medium">
            Glissez-déposez vos fichiers ici
        </p>

        <p class="text-sm text-text/60">
            ou cliquez pour sélectionner
        </p>

        <p v-if="files.length" class="text-sm text-primary">
            "{{ files[0]?.name }}"" sélectionné
        </p>

    </label>

</template>


<script setup lang="ts">

import { ref } from "vue";
import files from "~/assets/ts/Files";

const props = defineProps<{
  multiple?: boolean;
}>();

const emit = defineEmits<{
  (e: "files", files: File[]): void;
}>();

const isDragging = ref(false);

const onDragEnter = () => {
  isDragging.value = true;
}

const onDragLeave = () => {
  isDragging.value = false;
}

const onDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (!event.dataTransfer?.files) return;

  handleFiles(event.dataTransfer.files);
}

const onFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  handleFiles(input.files);
}

const handleFiles = (fileList: FileList) => {
  files.value = Array.from(fileList);
  emit("files", files.value);
}

</script>
