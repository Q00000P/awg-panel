<template>
  <div v-if="multiple" class="mb-4 flex items-center gap-2 text-sm">
    <span>{{ $t('client.interface') }}:</span>
    <select
      :value="current"
      class="rounded-lg border border-gray-300 bg-white px-2 py-1 dark:border-neutral-600 dark:bg-neutral-700"
      @change="onChange"
    >
      <option v-for="i in interfaces" :key="i.name" :value="i.name">
        {{ i.name }} — {{ i.isAwg31 ? 'AWG 3.1' : 'AWG 2.0' }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
const { interfaces, current, multiple, select } = useAdminInterface();

function onChange(e: Event) {
  select((e.target as HTMLSelectElement).value);
}
</script>
