<script setup lang="ts">
import type { Tag } from "~/types";
import { useWorkspaceTags } from "../composables/useWorkspaceTags";
import TagChip from "./TagChip.vue";

const props = defineProps<{ workspaceSlug: string; canManage: boolean }>();

const { tags, isLoading, isError, refetch, createTag, updateTag, deleteTag } = useWorkspaceTags(() => props.workspaceSlug);

const PRESET_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#64748b"];

const draft = reactive({ id: "", name: "", color: PRESET_COLORS[0], description: "" });
const isEditing = computed(() => Boolean(draft.id));
const pendingDelete = ref<Tag | null>(null);

const resetDraft = () => Object.assign(draft, { id: "", name: "", color: PRESET_COLORS[0], description: "" });
const startEditing = (tag: Tag) => Object.assign(draft, { id: tag.id, name: tag.name, color: tag.color, description: tag.description ?? "" });

const submit = async () => {
	const name = draft.name.trim();
	if (!name) return;
	const payload = { name, color: draft.color, description: draft.description.trim() || undefined };
	if (isEditing.value) await updateTag.mutateAsync({ id: draft.id, ...payload });
	else await createTag.mutateAsync(payload);
	resetDraft();
};

const confirmDelete = async () => {
	if (!pendingDelete.value) return;
	await deleteTag.mutateAsync(pendingDelete.value.id);
	if (draft.id === pendingDelete.value.id) resetDraft();
	pendingDelete.value = null;
};

const isSaving = computed(() => createTag.isPending.value || updateTag.isPending.value);
</script>

<template>
	<section class="space-y-4">
		<div>
			<h3 class="text-text-primary text-sm font-bold">Tags</h3>
			<p class="text-text-secondary mt-1 text-sm">Tags group work across statuses. Anyone can apply them; only admins can rename or delete them.</p>
		</div>

		<form v-if="canManage" class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]" @submit.prevent="submit">
			<div class="space-y-3">
				<Input v-model="draft.name" :placeholder="isEditing ? 'Tag name' : 'New tag name'" aria-label="Tag name" maxlength="40" />
				<Input v-model="draft.description" placeholder="Description (optional)" aria-label="Tag description" maxlength="120" />
				<fieldset class="flex flex-wrap items-center gap-2">
					<legend class="text-text-tertiary mb-2 text-xs font-semibold uppercase">Colour</legend>
					<Pressable
						v-for="color in PRESET_COLORS"
						:key="color"
						static
						class="size-6 rounded-full border-2 transition-transform"
						:class="draft.color === color ? 'border-text-primary scale-110' : 'border-transparent'"
						:style="{ backgroundColor: color }"
						:aria-label="`Use colour ${color}`"
						:aria-pressed="draft.color === color"
						@click="draft.color = color"
					/>
				</fieldset>
			</div>
			<div class="flex items-start gap-2">
				<Button type="submit" :disabled="!draft.name.trim() || isSaving">{{ isEditing ? "Save tag" : "Add tag" }}</Button>
				<Button v-if="isEditing" type="button" variant="ghost" @click="resetDraft">Cancel</Button>
			</div>
		</form>

		<div v-if="isLoading" class="space-y-2"><Skeleton class="h-10 w-full" /><Skeleton class="h-10 w-full" /></div>

		<AppEmptyState
			v-else-if="isError"
			heading="Unable to load tags"
			body="Check your connection and try again."
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetch(), variant: 'secondary' }"
		/>

		<ul v-else-if="tags.length" class="divide-border divide-y border-t">
			<li v-for="tag in tags" :key="tag.id" class="flex items-center gap-3 py-3">
				<TagChip :tag="tag" size="md" />
				<span v-if="tag.description" class="text-text-secondary min-w-0 truncate text-sm">{{ tag.description }}</span>
				<span class="text-text-tertiary ms-auto shrink-0 font-mono text-xs tabular-nums">{{ tag.taskCount ?? 0 }} tasks</span>
				<template v-if="canManage">
					<Button type="button" variant="ghost" size="icon" @click="startEditing(tag)">
						<Icon name="lucide:pencil" :size="14" /><span class="sr-only">Edit {{ tag.name }}</span>
					</Button>
					<Button type="button" variant="ghost" size="icon" @click="pendingDelete = tag">
						<Icon name="lucide:trash-2" :size="14" /><span class="sr-only">Delete {{ tag.name }}</span>
					</Button>
				</template>
			</li>
		</ul>

		<p v-else class="text-text-secondary text-sm">No tags yet.</p>

		<AlertDialog :open="Boolean(pendingDelete)" @update:open="(open: boolean) => !open && (pendingDelete = null)">
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete “{{ pendingDelete?.name }}”?</AlertDialogTitle>
					<AlertDialogDescription>
						It will be removed from {{ pendingDelete?.taskCount ?? 0 }} task{{ (pendingDelete?.taskCount ?? 0) === 1 ? "" : "s" }}. The tasks themselves are not affected.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction :disabled="deleteTag.isPending.value" @click="confirmDelete">Delete tag</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	</section>
</template>
