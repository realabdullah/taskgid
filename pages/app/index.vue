<script lang="ts" setup>
import { toast } from "vue-sonner";
import { useStore } from "../../stores";
import { useWorkspacesStore } from "../../stores/workspaces";
import { formatDate } from "../../utils";

definePageMeta({
	name: "app",
	title: "Dashboard",
	description: "Taskgid — Tasks, in view.",
	layout: "workspace",
});

const { user } = storeToRefs(useStore());
const { workspaces } = storeToRefs(useWorkspacesStore());

const isInviteOpen = ref(false);
const isCreateWorkspaceOpen = useState<boolean>("create-workspace-open", () => false);

const selectedWorkspace = computed(() => workspaces.value?.[0]);

const greeting = computed(() => {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
});

const currentDate = computed(() => formatDate(new Date().toISOString(), "dddd, MMMM D"));

const openNewTask = async () => {
	if (!selectedWorkspace.value) {
		toast("Please create a workspace first to manage tasks.");
		openCreateWorkspace();
		return;
	}
	await navigateTo(`/app/workspaces/${selectedWorkspace.value.slug}/tasks`);
};

const openInvite = () => {
	if (!selectedWorkspace.value) {
		toast("Please create a workspace first to invite teammates.");
		openCreateWorkspace();
		return;
	}
	isInviteOpen.value = true;
};

const openCreateWorkspace = () => {
	isCreateWorkspaceOpen.value = true;
};
</script>

<template>
	<div class="space-y-8 pb-8">
		<section class="border-border flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
			<div>
				<p class="text-text-tertiary text-sm font-semibold">{{ currentDate }}</p>
				<h1 class="page-heading mt-2">{{ greeting }}, {{ user?.firstName }}.</h1>
				<p class="page-intro mt-3">Start with the tasks that need a decision, an owner, or an update.</p>
			</div>

			<section class="flex flex-wrap items-center gap-2 lg:justify-end">
				<Button class="focus-ring h-10 px-4 shadow-xs" @click="openNewTask"><Icon name="lucide:plus" :size="16" />New task</Button>
				<Button variant="secondary" class="h-10" @click="openInvite"><Icon name="lucide:user-plus" :size="16" />Invite teammate</Button>
				<Button variant="secondary" class="h-10" @click="openCreateWorkspace"><Icon name="lucide:folder-plus" :size="16" />New workspace</Button>
			</section>
		</section>

		<AppPendingInvites />

		<template v-if="selectedWorkspace">
			<AppMyTasksWidget />
			<AppDashboardWorkspaces />
			<AppWorkspaceInvite v-model="isInviteOpen" :workspace="selectedWorkspace" />
		</template>

		<AppEmptyState
			v-else
			heading="Create your first workspace"
			subheading="Welcome to Taskgid"
			body="You need a workspace to structure your team, create tasks, and start collaborating."
			icon="hugeicons:folder-add"
			:action="{
				label: 'New workspace',
				onClick: openCreateWorkspace,
				variant: 'primary',
			}"
			class="mt-8"
		/>
	</div>
</template>
