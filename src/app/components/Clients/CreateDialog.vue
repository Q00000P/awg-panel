<template>
  <BaseDialog :trigger-class="triggerClass" @update:open="resetOnOpen">
    <template #trigger>
      <slot />
    </template>
    <template #title>
      {{ $t('client.new') }}
    </template>
    <template #description>
      <div class="flex flex-col">
        <FormTextField id="name" v-model="name" :label="$t('client.name')" />
        <FormDateField
          id="expiresAt"
          v-model="expiresAt"
          :label="$t('client.expireDate')"
        />
        <div v-if="showInterfacePicker" class="mt-2 flex flex-col gap-1">
          <FormLabel for="interfaceId">{{ $t('client.interface') }}</FormLabel>
          <select
            id="interfaceId"
            v-model="interfaceId"
            class="rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-neutral-600 dark:bg-neutral-700"
          >
            <option v-for="i in enabledInterfaces" :key="i.name" :value="i.name">
              {{ i.name }} — {{ i.isAwg31 ? 'AWG 3.1' : 'AWG 2.0' }}
            </option>
          </select>
        </div>
      </div>
    </template>
    <template #actions>
      <DialogClose as-child>
        <BaseSecondaryButton>{{ $t('dialog.cancel') }}</BaseSecondaryButton>
      </DialogClose>
      <DialogClose as-child>
        <BasePrimaryButton @click="createClient">
          {{ $t('client.create') }}
        </BasePrimaryButton>
      </DialogClose>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
const name = ref<string>('');
const expiresAt = ref<string | null>(null);
const interfaceId = ref<string | undefined>(undefined);
const clientsStore = useClientsStore();

const { data: interfaces } = await useFetch('/api/interfaces');

const enabledInterfaces = computed(
  () => interfaces.value?.filter((i) => i.enabled) ?? []
);

// One interface behaves exactly as before — no picker, no choice to make
const showInterfacePicker = computed(() => enabledInterfaces.value.length > 1);

const { t } = useI18n();

defineProps<{ triggerClass?: string }>();

function resetOnOpen(open: boolean) {
  if (!open) return;

  name.value = '';
  expiresAt.value = null;
  interfaceId.value = enabledInterfaces.value[0]?.name;
}

function createClient() {
  return _createClient({
    name: name.value,
    expiresAt: expiresAt.value,
    interfaceId: showInterfacePicker.value ? interfaceId.value : undefined,
  });
}

const _createClient = useSubmit(
  (data) =>
    $fetch('/api/client', {
      method: 'post',
      body: data,
    }),
  {
    revert: () => clientsStore.refresh(),
    successMsg: t('client.created'),
  }
);
</script>
