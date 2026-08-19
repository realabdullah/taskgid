<script setup lang="ts">
import type { Tag } from "~/types";
import { useWorkspaceTags } from "../composables/useWorkspaceTags";
import TagChip from "./TagChip.vue";

const props = withDefaults(defineProps<{ workspaceSlug: string; placeholder?: string; allowCreate?: boolean }>(), {
	placeholder: "Add tags…",
	allowCreate: true,
});

/** Tag **names**, which is what the task endpoints accept in `body.tags`. */
const selected = defineModel<string[]>({ default: () => [] });

const { tags, isLoading, isError, refetch, createTag, updateTag, deleteTag, canManage } = useWorkspaceTags(() => props.workspaceSlug);
const search = ref("");
const isOpen = ref(false);

const PRESET_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#64748b"];

const isManaging = ref(false);
const editing = ref<Tag | null>(null);
const pendingDelete = ref<Tag | null>(null);
const draft = reactive({ name: "", color: PRESET_COLORS[0], description: "" });

const selectedTags = computed(() => selected.value.map((name) => tags.value.find((tag) => tag.name === name) ?? ({ id: name, name, color: "" } as Tag)));
const matches = computed(() => {
	const needle = search.value.trim().toLowerCase();
	return needle ? tags.value.filter((tag) => tag.name.toLowerCase().includes(needle)) : tags.value;
});
const canCreate = computed(() => {
	const name = search.value.trim();
	return props.allowCreate && Boolean(name) && !tags.value.some((tag) => tag.name.toLowerCase() === name.toLowerCase());
});

const toggle = (name: string) => {
	selected.value = selected.value.includes(name) ? selected.value.filter((item) => item !== name) : [...selected.value, name];
};

const createAndSelect = async () => {
	const name = search.value.trim();
	if (!name) return;
	const tag = await createTag.mutateAsync({ name, color: PRESET_COLORS[0] });
	if (tag?.name) toggle(tag.name);
	search.value = "";
};

const startEditing = (tag: Tag) => {
	editing.value = tag;
	Object.assign(draft, { name: tag.name, color: tag.color || PRESET_COLORS[0], description: tag.description ?? "" });
};

const cancelEditing = () => {
	editing.value = null;
	Object.assign(draft, { name: "", color: PRESET_COLORS[0], description: "" });
};

/*
 * Selection tracks tag names, so a rename has to move the old name across or the
 * tag silently drops off every task the picker is editing.
 */
const saveEditing = async () => {
	const tag = editing.value;
	const name = draft.name.trim();
	if (!tag || !name) return;
	await updateTag.mutateAsync({ id: tag.id, name, color: draft.color, description: draft.description.trim() || undefined });
	if (selected.value.includes(tag.name) && name !== tag.name) selected.value = selected.value.map((item) => (item === tag.name ? name : item));
	cancelEditing();
};

/*
 * Confirming closes the dialog, which clears `pendingDelete` before the click
 * handler runs, so the tag being deleted is held outside that state.
 */
let deleteTarget: Tag | null = null;
const askDelete = (tag: Tag) => {
	deleteTarget = tag;
	pendingDelete.value = tag;
};

const confirmDelete = async () => {
	const tag = deleteTarget;
	pendingDelete.value = null;
	if (!tag) return;
	await deleteTag.mutateAsync(tag.id);
	if (selected.value.includes(tag.name)) selected.value = selected.value.filter((item) => item !== tag.name);
	if (editing.value?.id === tag.id) cancelEditing();
};

const leaveManaging = () => {
	isManaging.value = false;
	cancelEditing();
};

watch(isOpen, (open) => {
	if (!open) leaveManaging();
});
</script>

<template>
	<div class="space-y-2">
		<Popover v-model:open="isOpen">
			<PopoverTrigger as-child>
				<Button
					variant="outline"
					role="combobox"
					:aria-expanded="isOpen"
					class="h-12 w-full !justify-start !transition-none focus-visible:!ring-0 active:!scale-100"
					content-class="grid w-full grid-cols-[minmax(0,1fr)_1rem] gap-3"
				>
					<span class="min-w-0 truncate text-start">{{ selected.length ? `${selected.length} tag${selected.length === 1 ? "" : "s"} selected` : placeholder }}</span>
					<Icon name="lucide:chevron-down" :size="16" class="justify-self-end opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" :side-offset="8" class="w-[min(24rem,calc(100vw-2rem))] p-0">
				<div v-if="isLoading" class="space-y-2 p-3"><Skeleton class="h-8 w-full" /><Skeleton class="h-8 w-full" /></div>

				<div v-else-if="isError" class="p-3">
					<AppEmptyState
						heading="Unable to load tags"
						body="Check your connection and try again."
						icon="lucide:alert-circle"
						:action="{ label: 'Retry', onClick: () => refetch(), variant: 'secondary' }"
					/>
				</div>

				<template v-else-if="!isManaging">
					<Command class="border-0 shadow-none" :filter-function="(list: unknown[]) => list">
						<CommandInput v-model="search" placeholder="Search or create a tag…" />
						<CommandList>
							<CommandEmpty v-if="!canCreate">No matching tags.</CommandEmpty>
							<CommandGroup>
								<CommandItem v-for="tag in matches" :key="tag.id" :value="tag.name" class="flex items-center gap-3 px-3 py-2" @select="toggle(tag.name)">
									<Icon name="lucide:check" :size="16" :class="selected.includes(tag.name) ? 'text-primary opacity-100' : 'opacity-0'" />
									<TagChip :tag="tag" />
									<span v-if="tag.taskCount !== undefined" class="text-text-tertiary ms-auto font-mono text-xs tabular-nums">{{ tag.taskCount }}</span>
								</CommandItem>
								<CommandItem v-if="canCreate" :value="`create-${search}`" class="flex items-center gap-3 px-3 py-2" @select="createAndSelect">
									<Icon name="lucide:plus" :size="16" />
									<span class="truncate text-sm">Create “{{ search.trim() }}”</span>
								</CommandItem>
							</CommandGroup>
						</CommandList>
					</Command>

					<div v-if="canManage && tags.length" class="border-border border-t p-1.5">
						<Button variant="ghost" size="sm" class="w-full !justify-start" @click="isManaging = true"><Icon name="lucide:settings-2" :size="15" /> Manage tags</Button>
					</div>
				</template>

				<div v-else class="max-h-[24rem] overflow-y-auto">
					<div class="border-border flex items-center gap-2 border-b p-2">
						<Button variant="ghost" size="icon" class="size-7" aria-label="Back to tag selection" @click="leaveManaging"><Icon name="lucide:arrow-left" :size="15" /></Button>
						<p class="text-sm font-medium">Manage tags</p>
					</div>

					<form v-if="editing" class="border-border space-y-3 border-b p-3" @submit.prevent="saveEditing">
						<Input v-model="draft.name" aria-label="Tag name" placeholder="Tag name" maxlength="40" />
						<Input v-model="draft.description" aria-label="Tag description" placeholder="Description (optional)" maxlength="120" />
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
						<div class="flex justify-end gap-2">
							<Button type="button" variant="ghost" size="sm" @click="cancelEditing">Cancel</Button>
							<Button type="submit" size="sm" :disabled="!draft.name.trim()" :loading="updateTag.isPending.value" loading-label="Saving">Save tag</Button>
						</div>
					</form>

					<ul class="divide-border divide-y">
						<li v-for="tag in tags" :key="tag.id" class="flex items-center gap-2 px-3 py-2">
							<TagChip :tag="tag" />
							<span class="text-text-tertiary ms-auto shrink-0 font-mono text-xs tabular-nums">{{ tag.taskCount ?? 0 }}</span>
							<Button variant="ghost" size="icon" class="size-7" :aria-label="`Edit ${tag.name}`" @click="startEditing(tag)"><Icon name="lucide:pencil" :size="14" /></Button>
							<Button variant="ghost" size="icon" class="size-7" :aria-label="`Delete ${tag.name}`" @click="askDelete(tag)"><Icon name="lucide:trash-2" :size="14" /></Button>
						</li>
					</ul>
				</div>
			</PopoverContent>
		</Popover>

		<div v-if="selectedTags.length" class="flex flex-wrap gap-1.5">
			<TagChip v-for="tag in selectedTags" :key="tag.id" :tag="tag" removable @remove="toggle(tag.name)" />
		</div>

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
	</div>
</template>
