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

const { tags, isLoading, isError, refetch, createTag } = useWorkspaceTags(() => props.workspaceSlug);
const search = ref("");
const isOpen = ref(false);

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
	const tag = await createTag.mutateAsync({ name, color: "#3b82f6" });
	if (tag?.name) toggle(tag.name);
	search.value = "";
};
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
				<Command class="border-0 shadow-none" :filter-function="(list: unknown[]) => list">
					<CommandInput v-model="search" placeholder="Search or create a tag…" />
					<CommandList>
						<div v-if="isLoading" class="space-y-2 p-3"><Skeleton class="h-8 w-full" /><Skeleton class="h-8 w-full" /></div>

						<div v-else-if="isError" class="p-3">
							<AppEmptyState
								heading="Unable to load tags"
								body="Check your connection and try again."
								icon="lucide:alert-circle"
								:action="{ label: 'Retry', onClick: () => refetch(), variant: 'secondary' }"
							/>
						</div>

						<template v-else>
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
						</template>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>

		<div v-if="selectedTags.length" class="flex flex-wrap gap-1.5">
			<TagChip v-for="tag in selectedTags" :key="tag.id" :tag="tag" removable @remove="toggle(tag.name)" />
		</div>
	</div>
</template>
