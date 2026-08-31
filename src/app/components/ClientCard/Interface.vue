<template>
  <span
    v-if="showBadge"
    class="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-neutral-700 dark:text-neutral-300"
  >
    {{ client.interfaceId }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  client: LocalClient;
}>();

const { data: interfaces } = await useFetch('/api/interfaces');

// Only worth showing when there is something to distinguish
const showBadge = computed(
  () => (interfaces.value?.length ?? 0) > 1 && !!props.client.interfaceId
);
</script>
