<script setup lang="ts">
import { defineEmits } from 'vue'

const emit = defineEmits<{
  (e: 'file-selected', file: File): void
}>()

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    emit('file-selected', file)
  }
}
</script>

<template>
  <form class="rounded-2xl text-center text-lg max-w-[330px]">
    <label
      for="file-input"
      class="relative flex flex-col justify-center items-center 
             gap-2.5 p-2.5 rounded-xl border-2 border-dashed border-[var(--primary)] 
             cursor-pointer transition duration-400 ease-in-out 
             hover:bg-[#c39eff10] hover:backdrop-blur-[30px] hover:border-[var(--second)]"
    >
      <span class="text-[20px] font-bold text-center transition-colors duration-400 ease-in-out">
        Glisser le fichier
      </span>
      <span>ou</span>

      <input
        type="file"
        id="file-input"
        class="max-w-full text-[#444] p-0.5 bg-white rounded-xl border border-black/30 
               file:mr-4 file:border-none file:bg-[var(--primary)] file:px-2.5 
               file:py-1.5 file:rounded-xl file:text-white file:cursor-pointer 
               file:transition-colors file:duration-200 hover:file:bg-[var(--primary-hover)]"
        @change="handleFileChange"
      />
    </label>
  </form>
</template>
