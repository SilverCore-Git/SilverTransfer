<template>

    <div>
        
        <h1>sending...</h1>
        <p>{{ percent }}%</p>

    </div>

</template>

<script lang="ts" setup>

import { ref } from 'vue';

const percent = ref<number>(0);

onMounted(() => {
    setTimeout(() => {
        const interval = setInterval(() => {
            if (percent.value >= 100) {
                clearInterval(interval);
                navigateTo('/done')
            }
            if (percent.value > 20) return percent.value += 10;
            percent.value++;
        }, 500)
    }, 2000)
})

</script>