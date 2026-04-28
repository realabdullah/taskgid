<script lang="ts" setup>
import { useQueryClient } from "@tanstack/vue-query"
import { toast } from "vue-sonner"
import type { Task } from "~/types"

const props = defineProps<{
	task: Task;
	workspaceSlug: string;
}>();

const client = useQueryClient();

const titleDraft = ref(props.task.title);
const descriptionDraft = ref(props.task.description || "");
const isEditingTitle = ref(false);
const isEditingDescription = ref(false);
const isSaving = ref(false);

watch(
	() => props.task,
	(nextTask) => {
		titleDraft.value = nextTask.title;
		descriptionDraft.value = nextTask.description || "";
		isEditingTitle.value = false;
		isEditingDescription.value = false;
	},
	{ deep: true }
);

const invalidateTask = async () => {
	await Promise.all([
		client.invalidateQueries({ queryKey: ["task", props.task.id] }),
		client.invalidateQueries({ queryKey: ["workspace-tasks", props.workspaceSlug] }),
	]);
};

const patchTask = async (body: Partial<Pick<Task, "title" | "description">>) => {
	try {
		isSaving.value = true;
		const { success } = await useApiFetch<{ success: boolean }>(API_ENDPOINTS.workspaces.taskById(props.workspaceSlug, props.task.id), {
			method: "PATCH",
			body,
		});
		if (!success) {
			throw new Error("Failed to update task");
		}
		await invalidateTask();
	} catch (error) {
		toast.error(getServerError(error));
	} finally {
		isSaving.value = false;
	}
};

const saveTitle = async () => {
	const nextTitle = titleDraft.value.trim();
	if (!nextTitle || nextTitle === props.task.title) {
		titleDraft.value = props.task.title;
		isEditingTitle.value = false;
		return;
	}
	await patchTask({ title: nextTitle });
	isEditingTitle.value = false;
};

const saveDescription = async () => {
	const nextDescription = descriptionDraft.value.trim();
	const currentDescription = props.task.description?.trim() || "";
	if (nextDescription === currentDescription) {
		isEditingDescription.value = false;
		return;
	}
	await patchTask({ description: nextDescription });
	isEditingDescription.value = false;
};
</script>

<template>
	<section class="space-y-4">
		<div>
			<input
				v-if="isEditingTitle"
				v-model="titleDraft"
				class="border-border bg-surface-0 text-text-primary h-12 w-full rounded-md border px-3 text-2xl font-semibold focus-visible:ring-2 focus-visible:outline-none"
				:disabled="isSaving"
				autofocus
				@blur="saveTitle"
				@keydown.enter.prevent="saveTitle"
				@keydown.esc.prevent="isEditingTitle = false"
			/>
			<button
				v-else
				type="button"
				class="text-text-primary hover:bg-surface-1 min-h-11 w-full rounded-md px-2 py-1 text-left text-2xl font-semibold"
				@click="isEditingTitle = true"
			>
				{{ props.task.title }}
			</button>
		</div>

		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<p class="text-text-tertiary text-xs font-semibold tracking-widest uppercase">Description</p>
				<div class="flex items-center gap-2">
					<Button v-if="isEditingDescription" type="button" variant="ghost" size="sm" class="h-11 px-3" :disabled="isSaving" @click="isEditingDescription = false">
						Cancel
					</Button>
					<Button
						v-if="isEditingDescription"
						type="button"
						size="sm"
						class="h-11 px-3"
						:disabled="isSaving"
						@click="saveDescription"
					>
						Save
					</Button>
					<Button v-else type="button" variant="ghost" size="sm" class="h-11 px-3" @click="isEditingDescription = true">Edit</Button>
				</div>
			</div>

			<textarea
				v-if="isEditingDescription"
				v-model="descriptionDraft"
				class="border-border bg-surface-0 text-text-secondary min-h-44 w-full rounded-md border px-3 py-3 text-sm leading-7 focus-visible:ring-2 focus-visible:outline-none"
				:disabled="isSaving"
				placeholder="Add a description..."
			/>
			<div v-else class="text-text-secondary text-sm leading-7 whitespace-pre-wrap" v-html="props.task.description || 'No description yet.'"></div>
		</div>
	</section>
</template>
