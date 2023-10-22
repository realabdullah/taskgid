<script lang="ts" setup>
definePageMeta({
	title: "Home",
	name: "home",
	middleware: ["auth"],
});

const route = useRoute();

const { activeWorkspace } = storeToRefs(useStore());
const { fetchUserInfo, setWorkspace, fetchWorkspaceTasks } = useStore();

await fetchUserInfo();

if (route.query.workspace) setWorkspace(route.query.workspace as string);

await fetchWorkspaceTasks();

navigateTo({ name: "dashboard", params: { workspace: activeWorkspace.value } });
</script>

<!-- eslint-disable-next-line vue/valid-template-root -->
<template></template>
