<script lang="ts" setup>
definePageMeta({
	name: "task-id",
	title: "Task",
	layout: "workspace",
	middleware: [
		(to) =>
			navigateTo(
				{
					path: `/app/workspaces/${String(to.params.slug)}/tasks`,
					query: { taskId: String(to.params.id) },
				},
				{ replace: true }
			),
	],
});
</script>
