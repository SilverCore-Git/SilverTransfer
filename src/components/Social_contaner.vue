<template>

    <ul class="social-contaner">

        <a target="_blank" href="https://www.silvercore.fr"> <li data-tooltip="Site de silvercore" class="social-icon"> <img src="https://www.silvercore.fr/silvercore_logo.svg" alt="logo silvercore" style="border-radius: 50rem;"> </li> </a>
        <a target="_blank" href="https://discord.gg/ftFhQTJsQ5"> <li data-tooltip="Discord SilverCore" class="social-icon"> <i class="bi bi-discord"> </i> </li> </a>
        <a target="_blank" href="https://discord.gg/mKs3uMTJWM"> <li data-tooltip="Discord support" class="social-icon"> <i class="bi bi-life-preserver"> </i> </li> </a>
        <a target="_blank" href="https://github.com/SilverCore-Git/SilverTransfer"> <li data-tooltip="Open source sur GitHub" class="social-icon"> <i class="bi bi-github"> </i> </li> </a>

    </ul> 

</template>

<style scoped>

.social-contaner {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: 2rem;
  list-style: none;
}


.social-icon {
  font-size: 2rem;
  cursor: pointer;
  color: rgb(0, 0, 0);
  transition: all 0.3s;
}

.social-icon img {
  width: 30px;
}

.social-icon:hover {
  transform: scale(1.1);
}


.social-icon:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: black;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 14px;
  white-space: nowrap;
  opacity: 1;
  visibility: visible;
  transition: opacity 0.2s ease-in-out;
}

.social-icon:hover::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: black;
  margin-bottom: -12px;
  opacity: 1;
  visibility: visible;
  transition: opacity 0.2s ease-in-out;
}

.social-icon::after,
.social-icon::before {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease-in-out;
}

</style>