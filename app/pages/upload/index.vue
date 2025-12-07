<template>

    <div>

        <button @click="handleUpload">
            upload
        </button>

    </div>

</template>

<script lang="ts" setup>

const handleUpload = () => {
    navigateTo('/sending')
}

</script>