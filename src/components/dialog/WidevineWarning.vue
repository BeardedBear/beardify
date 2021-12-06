<template>
  <div class="content">
    <p>
      En tant qu'utilisateur de Brave, afin de pouvoir utiliser <b>Beardify</b>, vous devez activer l'option
      <b>Widevine</b> afin de pouvoir lire des morceaux provenant de <b>Spotify</b>.
    </p>

    <p>
      Pour ce faire, entrez l'adresse suivante <code>brave://settings/?search=widevine</code>puis activez
      <b>Widevine</b>.
    </p>
  </div>
</template>

<style lang="scss" scoped>
.content {
  padding: 1.2rem;
  text-align: center;
  width: 22rem;
}

code {
  background-color: var(--bg-color-darker);
  border-radius: 0.4rem;
  display: block;
  font-size: 0.9rem;
  margin: 0.4rem 0;
  padding: 0.3rem;
}

b {
  color: var(--primary-color);
}
</style>
