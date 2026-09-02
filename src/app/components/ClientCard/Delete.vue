<template>
  <ClientsDeleteDialog :client-name="client.name" @delete="deleteClient">
    <div
      class="rounded bg-gray-100 p-2 align-middle transition hover:bg-red-800 hover:text-white dark:bg-neutral-600 dark:text-neutral-300 dark:hover:bg-red-800 dark:hover:text-white"
      :title="$t('client.deleteClient')"
    >
      <IconsDelete class="w-5" />
    </div>
  </ClientsDeleteDialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  client: LocalClient;
}>();

const clientsStore = useClientsStore();

const _deleteClient = useSubmit(
  () =>
    $fetch(`/api/client/${props.client.id}`, {
      method: 'delete',
    }),
  {
    revert: async () => {
      await clientsStore.refresh();
    },
  }
);

function deleteClient() {
  return _deleteClient(undefined);
}
</script>
