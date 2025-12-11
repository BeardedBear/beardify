<template>
  <div class="album-group">
    <div class="album-group-wrapper">
      <div class="album-group-main">
        <Album
          :album="displayAlbum"
          :can-delete="canDelete"
          :can-save="canSave"
          :cover-size="coverSize"
          :exact-search="exactSearch"
          :with-artists="withArtists"
          :without-metas="withoutMetas"
          :without-release-date="withoutReleaseDate"
          :variant-count="group.variants.length > 0 ? group.variants.length + 1 : undefined"
          :variant-click="group.variants.length > 0 ? openVariantsDialog : undefined"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { ImageSize } from "@/@types/Image";
import Album from "@/components/album/AlbumIndex.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import { AlbumGroup, getDisplayName } from "@/helpers/groupAlbumVariants";

const props = defineProps<{
  canDelete?: boolean;
  canSave?: boolean;
  cleanName?: boolean;
  coverSize?: ImageSize | undefined;
  exactSearch?: boolean;
  group: AlbumGroup;
  withArtists?: boolean;
  withoutMetas?: boolean;
  withoutReleaseDate?: boolean;
}>();

const dialogStore = useDialog();

const displayAlbum = computed(() => {
  return {
    ...props.group.baseAlbum,
    name: props.cleanName ? getDisplayName(props.group.baseAlbum.name) : props.group.baseAlbum.name,
  };
});

function openVariantsDialog(): void {
  dialogStore.open({
    type: "albumVariants",
    albumGroup: props.group,
  });
}
</script>
