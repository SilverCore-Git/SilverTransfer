<script setup>
defineProps({
  error: Object
})
</script>

<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="text-center">
            <h1 class="text-6xl font-bold text-gray-800 mb-4">
                {{ error?.statusCode || 404 }}
            </h1>
            
            <p class="text-2xl text-gray-600 mb-8">
                {{ error?.statusMessage || 'Page not found' }}
            </p>
            
            <NuxtLink 
                to="/" 
                class="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primaryHover transition"
            >
                Retour à l'accueil
            </NuxtLink>
        </div>
    </div>
</template>
