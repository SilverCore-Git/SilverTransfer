<template>

    <div 
        class="flex justify-center items-center w-full h-15 mx-auto text-center p-4 notranslate
        backdrop-blur-[50px] bg-[#5440d4]/70 text-base shadow-sm fixed bottom-0 left-0 right-0
        "
    >

        <strong><p>&copy; {{ year }} SilverTransfert. Tous droits réservés.</p></strong>

    </div>

</template>

<script lang="ts" setup>


const year: number = new Date().getFullYear();

</script>