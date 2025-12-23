
const files = ref<File[]>([]);

watch(() => files.value, () => console.log(files.value))

export default files;