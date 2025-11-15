<template>

    <main class="main">

        <div class="card">

            <a class="title notranslate" href="/"><h1>SilverTransfert</h1></a>
            <h2>Outil de transfert de fichiers</h2>
                
            <ul class="font-bold my-5">

                <li><i>🇫🇷</i> Hébergé en France</li>
                <li><i class="bi bi-lock"></i> Chiffré de bout en bout</li>
                <li><i class="bi bi-heart"></i> Politique éthique</li>
                <li><i class="bi bi-trash"></i> Supprimé après 30 jours<div style="margin-right: 16rem;"></div></li>
                <li><i class="bi bi-cloud-arrow-down"></i> Jusqu'à 10Go</li>
                <li 
                    class="flex flex-row justify-start items-center cursor-pointer"
                    onclick="window.open('https://www.silvercore.fr', '_blank')" 
                >
                    <img 
                        style="width: 20px; height: 20px;" 
                        src="https://www.silvercore.fr/silvercore_logo.svg"
                    > By SilverCore
                </li>
           
            </ul>

            <!-- From Uiverse.io by Li-Deheng --> 
            <div @click="emit('btn-click')" class="btn-conteiner">

                <a class="btn-content">
                    <span class="btn-title">Faire un transfert</span>

                    <span class="icon-arrow">
                        <svg width="66px" height="43px" viewBox="0 0 66 43" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="arrow" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="arrow-icon-one" d="M40.1543933,3.89485454 L43.9763149,0.139296592 C44.1708311,-0.0518420739 44.4826329,-0.0518571125 44.6771675,0.139262789 L65.6916134,20.7848311 C66.0855801,21.1718824 66.0911863,21.8050225 65.704135,22.1989893 C65.7000188,22.2031791 65.6958657,22.2073326 65.6916762,22.2114492 L44.677098,42.8607841 C44.4825957,43.0519059 44.1708242,43.0519358 43.9762853,42.8608513 L40.1545186,39.1069479 C39.9575152,38.9134427 39.9546793,38.5968729 40.1481845,38.3998695 C40.1502893,38.3977268 40.1524132,38.395603 40.1545562,38.3934985 L56.9937789,21.8567812 C57.1908028,21.6632968 57.193672,21.3467273 57.0001876,21.1497035 C56.9980647,21.1475418 56.9959223,21.1453995 56.9937605,21.1432767 L40.1545208,4.60825197 C39.9574869,4.41477773 39.9546013,4.09820839 40.1480756,3.90117456 C40.1501626,3.89904911 40.1522686,3.89694235 40.1543933,3.89485454 Z" fill="#FFFFFF"></path>
                            <path id="arrow-icon-two" d="M20.1543933,3.89485454 L23.9763149,0.139296592 C24.1708311,-0.0518420739 24.4826329,-0.0518571125 24.6771675,0.139262789 L45.6916134,20.7848311 C46.0855801,21.1718824 46.0911863,21.8050225 45.704135,22.1989893 C45.7000188,22.2031791 45.6958657,22.2073326 45.6916762,22.2114492 L24.677098,42.8607841 C24.4825957,43.0519059 24.1708242,43.0519358 23.9762853,42.8608513 L20.1545186,39.1069479 C19.9575152,38.9134427 19.9546793,38.5968729 20.1481845,38.3998695 C20.1502893,38.3977268 20.1524132,38.395603 20.1545562,38.3934985 L36.9937789,21.8567812 C37.1908028,21.6632968 37.193672,21.3467273 37.0001876,21.1497035 C36.9980647,21.1475418 36.9959223,21.1453995 36.9937605,21.1432767 L20.1545208,4.60825197 C19.9574869,4.41477773 19.9546013,4.09820839 20.1480756,3.90117456 C20.1501626,3.89904911 20.1522686,3.89694235 20.1543933,3.89485454 Z" fill="#FFFFFF"></path>
                            <path id="arrow-icon-three" d="M0.154393339,3.89485454 L3.97631488,0.139296592 C4.17083111,-0.0518420739 4.48263286,-0.0518571125 4.67716753,0.139262789 L25.6916134,20.7848311 C26.0855801,21.1718824 26.0911863,21.8050225 25.704135,22.1989893 C25.7000188,22.2031791 25.6958657,22.2073326 25.6916762,22.2114492 L4.67709797,42.8607841 C4.48259567,43.0519059 4.17082418,43.0519358 3.97628526,42.8608513 L0.154518591,39.1069479 C-0.0424848215,38.9134427 -0.0453206733,38.5968729 0.148184538,38.3998695 C0.150289256,38.3977268 0.152413239,38.395603 0.154556228,38.3934985 L16.9937789,21.8567812 C17.1908028,21.6632968 17.193672,21.3467273 17.0001876,21.1497035 C16.9980647,21.1475418 16.9959223,21.1453995 16.9937605,21.1432767 L0.15452076,4.60825197 C-0.0425130651,4.41477773 -0.0453986756,4.09820839 0.148075568,3.90117456 C0.150162624,3.89904911 0.152268631,3.89694235 0.154393339,3.89485454 Z" fill="#FFFFFF"></path>
                        </g>
                        </svg>
                    </span> 

                </a>

            </div>

            <div class="flex flex-row gap-3 font-bold text-lg mt-5">
                <span>Nous contacter ?</span>
                <a
                    href="mailto:contact@silvercore.fr"
                    >contact@silvercore.fr</a
                >
            </div>

        </div>

        <Social_contaner />

    </main>

</template>

<script lang="ts" setup>

import Social_contaner from './Social_contaner.vue';

const emit = defineEmits<{
  (e: 'btn-click'): void;
}>();


</script>

<style scoped>

main {
    display: flex;
    justify-content: center; 
    flex-direction: column;
    align-items: center; 
    height: 100vh;
    color: white;
    font-family: 'Roboto', sans-serif;
}


main h2 {
    font-size: 1.5rem;
}



 
.card ul { 
    list-style: none;

    font-size: 1.1rem;

    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    padding: 1rem;

    text-align: left;
    border-radius: 15px;
}
.card ul  li:not(:last-child) {
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid black;
}
.card ul li {
    margin-left: 5px;
}
.card ul i,
.card ul img {
    margin-right: 15px;
}
.card ul img {
    transform: translateY(3px);
    border-radius: 1rem;
}







/* From Uiverse.io by Li-Deheng */ 
.btn-conteiner {
  cursor: pointer;
  display: flex;
  justify-content: center;
  --color-text: #ffffff;
  --color-background: #ff135a;
  --color-outline: #ff145b80;
  --color-shadow: #00000080;
}

.btn-content {
  display: flex;
  align-items: center;
  padding: 3px 20px;
  text-decoration: none;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 20px;
  color: var(--color-text);
  background: var(--color-background);
  transition: 1s;
  border-radius: 100px;
  box-shadow: 0 0 0.2em 0 var(--color-background);
}

.btn-content:hover, .btn-content:focus {
  transition: 0.5s;
  -webkit-animation: btn-content 1s;
  animation: btn-content 1s;
  outline: 0.1em solid transparent;
  outline-offset: 0.2em;
  box-shadow: 0 0 0.4em 0 var(--color-background);
}

.btn-content .icon-arrow {
  transition: 0.5s;
  margin-right: 0px;
  transform: scale(0.6);
}

.btn-content:hover .icon-arrow {
  transition: 0.5s;
  margin-right: 25px;
}

.icon-arrow {
  width: 20px;
  margin-left: 15px;
  position: relative;
  top: 6%;
}
  
/* SVG */
#arrow-icon-one {
  transition: 0.4s;
  transform: translateX(-60%);
}

#arrow-icon-two {
  transition: 0.5s;
  transform: translateX(-30%);
}

.btn-content:hover #arrow-icon-three {
  animation: color_anim 1s infinite 0.2s;
}

.btn-content:hover #arrow-icon-one {
  transform: translateX(0%);
  animation: color_anim 1s infinite 0.6s;
}

.btn-content:hover #arrow-icon-two {
  transform: translateX(0%);
  animation: color_anim 1s infinite 0.4s;
}

/* SVG animations */
@keyframes color_anim {
  0% {
    fill: white;
  }

  50% {
    fill: var(--color-background);
  }

  100% {
    fill: white;
  }
}

/* Button animations */
@-webkit-keyframes btn-content {
  0% {
    outline: 0.2em solid var(--color-background);
    outline-offset: 0;
  }
}

@keyframes btn-content {
  0% {
    outline: 0.2em solid var(--color-background);
    outline-offset: 0;
  }
}

</style>