<script lang="ts" setup>
import { toast } from "vue-sonner";
import { useStore } from "../../stores";
import { useWorkspacesStore } from "../../stores/workspaces";
import { formatDate } from "../../utils";

definePageMeta({
	name: "app",
	title: "Dashboard",
	description: "TaskGid - Dashboard",
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
	<div class="space-y-8 pb-4">
		<section class="linear-shell rounded-xl p-6">
			<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<p class="text-2xs text-text-tertiary mb-2 font-semibold tracking-[0.12em] uppercase">My workspace</p>
					<h1 class="linear-title text-2xl font-semibold">{{ greeting }}, {{ user?.firstName }}.</h1>
					<p class="text-text-tertiary mt-1 text-sm">{{ currentDate }}</p>
				</div>

				<section class="flex flex-wrap items-center gap-3">
					<Button class="h-9 shadow-sm" @click="openNewTask">
						<Icon name="lucide:plus" :size="16" />
						New task
					</Button>
					<Button variant="secondary" class="h-9" @click="openInvite">
						<Icon name="lucide:user-plus" :size="16" />
						Invite teammate
					</Button>
					<Button variant="secondary" class="h-9" @click="openCreateWorkspace">
						<Icon name="lucide:folder-plus" :size="16" />
						New workspace
					</Button>
				</section>
			</div>
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
			subheading="Welcome to TaskGid"
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
