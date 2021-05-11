<template>
  <div class="config">
    <div>
      <button @click="switchThemeDark()">y</button>
    </div>
    <div>
      <button @click="switchThemeLight()">x</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import ArtistList from "../../components/ArtistList.vue";
import Cover from "../Cover.vue";
import { Mutations } from "./ConfigStore";

export default defineComponent({
  components: { ArtistList, Cover },
  setup() {
    const store = useStore<RootState>();

    function switchThemeLight() {
      store.commit(`config/${Mutations.SWITCH_THEME_LIGHT}`);
    }
    function switchThemeDark() {
      store.commit(`config/${Mutations.SWITCH_THEME_DARK}`);
    }

    return { store, switchThemeLight, switchThemeDark };
  }
});
</script>

<style lang="scss" scoped>
.config {
  background-color: red;
  padding: 20px;
  position: absolute;
  top: 100%;
  right: 0;
}
</style>
