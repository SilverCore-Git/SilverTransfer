<template>

    <div class="w-screen h-screen flex flex-col justify-center items-center">

        <Main 
            @btn-click="form('upload')" 
            v-if="main && !loader"
        />

        <Upload 
            @btn-click="send_file"
            @change-stronger="update_stronger"
            @file="get_file"
            v-if="upload"
        />

        <Sending
            :value="upload_progress"
            v-if="sending"
        />

        <Done 
            v-if="done"
            :data="final_link_data"
        />

        <Loader v-if="loader" />

    </div>

    <a 
        href="/patchnotes" target="_blank" 
        class="fixed bottom-20 left-6 font-bold no-underline hover:underline hidden min-[700px]:block"
    > SilverTransfert version <span>{{ version }}</span> </a>

    <div class="fixed bottom-20 right-6 font-bold no-underline hidden min-[700px]:block">

        <a class="hover:underline" href="/patchnotes" target="_blank"> Patchnotes </a>
        <a style="margin-right: 1rem; margin-left: 1rem;">  |  </a>
        <a class="hover:underline" href="/legale" target="_blank"> legale </a>
    </div>

</template>

<script lang="ts" setup>

import { onMounted, ref, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'

import send from '../assets/send';
import background from '../assets/background';
import { salert } from '../assets/salert';

import Main from '../components/Main.vue';
import Loader from '../components/Loader.vue';
import Upload from '../components/Upload.vue';
import Sending from '../components/Sending.vue';
import Done from '../components/Done.vue';

let version: string = "0.0.0";
const validForms = ['loader', 'main', 'upload', 'sending', 'done'] as const
type FormKey = typeof validForms[number]

const route = useRoute()
const router = useRouter()

const selectedFile = ref<File | null>(null)
const upload_progress = ref<number>(0);
const crypt_strong = ref<number>(10);
const final_link_data = ref<{ id: number, passwd: string }>({ id: -1, passwd: '' });

const main = ref(false);
const upload = ref(false);
const sending = ref(false);
const done = ref(false);

const loader = ref(true);

const forms: Record<FormKey, Ref<boolean>> = {
  loader,
  main,
  upload,
  sending,
  done
}

onMounted(async () => {

    version = await fetch('https://corsproxy.io?url=https://www.silvertransfert.fr/version').then(res => res.json());

    background();

    setInterval(() => {
        background();
    }, 10 * 1000)

    setTimeout(() => {

        loader.value = false

        const initial = route.query.form
        if (typeof initial === 'string' && validForms.includes(initial as FormKey)) {
            form(initial as FormKey)
        } else {
            form('main')
        }

    }, 1000)

})

const update_stronger = (value: number) => crypt_strong.value = value;

const form = (newForm: FormKey): void => {

  for (const key in forms) {
    forms[key as FormKey].value = false
  }

  forms[newForm].value = true
  form_query(newForm)

}

const form_query = (value: FormKey): void => {

  if (route.query.form !== value) {

    router.replace({
      query: {
        ...route.query,
        form: value,
      },
    })

  }

}

const query = (name: string, value: string) => {

  if (route.query.form !== value) {

    router.replace({
      query: {
        ...route.query,
        [name]: value,
      },
    })

  }

}

watch(() => route.query.form, (newForm) => {

    if (typeof newForm === 'string' && validForms.includes(newForm as FormKey)) {
      form(newForm as FormKey)
    }

  }
)

const get_file = async (file: File) => {

    query('f_name', file.name);

    setTimeout(() => {
        query('f_size', String(file.size));
    }, 100)
    
    setTimeout(() => {
        query('f_type', file.type);
    }, 100)

    setTimeout(() => {
        query('f', '1');
    }, 100)

    selectedFile.value = file;
    console.log("input :", file)
    console.log("const :", selectedFile.value)
    console.log('File saved :', file == selectedFile.value)

}

const send_file = async () => {

    const id: number = await fetch(`https://www.silvertransfert.fr/upload/create/id`).then(res => res.json()).then(res => res.id);
    const passwd: string = await fetch(`https://www.silvertransfert.fr/passwd/${crypt_strong.value}`).then(res => res.json());

    query('id', String(id));

    setTimeout(() => {
        query('passwd', passwd);
    }, 100)

    setTimeout(() => {
        query('link', '1');
    }, 100)

    final_link_data.value = {
        id,
        passwd
    }

    await send({

        file: selectedFile.value,
        url: `https://www.silvertransfert.fr/upload/file?passwd=${passwd}&id=${id}&user=ip`,

        onProgress: (percent, eta) => {
            upload_progress.value = percent;
            console.log(`Progress: ${percent}%`, eta);
        },

        onSuccess: (res) => {
            salert('Téléversement terminer !', 'success');
            console.log('Upload terminé !', res);
            form('done');
        },

        onError: (msg) => {
            salert('Une erreur est survenue.', 'error');
            console.error('Erreur :', msg);
            form('upload');
        }

    })

}

</script>