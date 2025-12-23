<template>

    <div 
        class="
            bg-bg2 max-w-xl max-w-2xl
            rounded-xl p-6 gap-[25px] text-center
            flex justify-start items-center flex-col
        "
    >
    
        <h1
            class="text-2xl font-semibold"
        >{{ title }}</h1>

        <slot />

        <button @click="emit('btnClick')" class="w-full">
            {{ btn }}
        </button>
    
    </div>
    
</template>

<script lang="ts" setup>

defineProps<{
    title: string;
    btn: string;
}>();

const emit = defineEmits<{
  (e: 'btnClick'): void
}>()

</script>