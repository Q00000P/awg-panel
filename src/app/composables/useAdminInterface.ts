/**
 * Which interface the admin pages are editing.
 *
 * Kept in the URL (?interface=awg1) so a reload or a link keeps the
 * selection, and so every admin fetch can append the same query.
 */
export function useAdminInterface() {
  const route = useRoute();
  const router = useRouter();

  const { data: interfaces } = useFetch('/api/interfaces');

  const current = computed<string>(() => {
    const q = route.query.interface;
    return typeof q === 'string' && q ? q : 'wg0';
  });

  const query = computed(() => ({ interface: current.value }));

  const multiple = computed(() => (interfaces.value?.length ?? 0) > 1);

  function select(name: string) {
    router.replace({ query: { ...route.query, interface: name } });
  }

  return { interfaces, current, query, multiple, select };
}
