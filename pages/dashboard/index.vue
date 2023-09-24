<script lang="ts" setup>
definePageMeta({
	title: "Home",
	name: "Home",
	middleware: ["auth"],
});

const route = useRoute();

const { activeWorkspace } = storeToRefs(useStore());
const { setActiveWorkspace } = useStore();

if (route.query.workspace) {
	setActiveWorkspace(route.query.workspace as string);
	route.query = {};
}

navigateTo({ name: "dashboard", params: { workspace: activeWorkspace.value } });
</script>
