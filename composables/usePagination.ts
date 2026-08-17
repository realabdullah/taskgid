export const usePagination = () => {
	const route = useRoute();

	const pagination = ref({
		page: Number(route.query.page) || 1,
		limit: Number(route.query.limit) || LIST_PAGE_SIZE,
	});

	const setPagination = (page: number, limit: number) => {
		pagination.value.page = page;
		pagination.value.limit = limit;

		// Update the route query parameters
		const newQuery = { ...route.query, page, limit };
		useRouter().push({ query: newQuery });
	};

	return { pagination, setPagination };
};
