<script lang="ts" setup>
import type { SavedView } from "../composables/useSavedViews";

const props = defineProps<{
	views: SavedView[];
	activeView: SavedView | undefined;
	isFiltered: boolean;
}>();

const emit = defineEmits<{ apply: [view: SavedView]; save: [name: string]; remove: [id: string] }>();

const isNaming = ref(false);
const draftName = ref("");

const canSave = computed(() => props.isFiltered && !props.activeView);

const confirmSave = () => {
	const name = draftName.value.trim();
	if (!name) return;
	emit("save", name);
	draftName.value = "";
	isNaming.value = false;
};
</script>

<template>
	<div class="flex flex-wrap items-center gap-1.5">
		<Button
			v-for="view in views"
			:key="view.id"
			:variant="activeView?.id === view.id ? 'secondary' : 'ghost'"
			size="sm"
			class="group gap-1.5"
			:aria-pressed="activeView?.id === view.id"
			@click="emit('apply', view)"
		>
			{{ view.name }}
			<Button
				v-if="!view.isBuiltIn"
				as="span"
				role="button"
				variant="ghost"
				size="icon"
				static
				class="-me-1 size-4 rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
				@click.stop="emit('remove', view.id)"
			>
				<Icon name="lucide:x" :size="10" />
				<span class="sr-only">Delete the {{ view.name }} view</span>
			</Button>
		</Button>

		<template v-if="isNaming">
			<Input v-model="draftName" class="h-8 w-40" placeholder="View name" aria-label="Name for this saved view" autofocus @keydown.enter.prevent="confirmSave" @keydown.esc="isNaming = false" />
			<Button size="sm" :disabled="!draftName.trim()" @click="confirmSave">Save</Button>
			<Button size="sm" variant="ghost" @click="isNaming = false">Cancel</Button>
		</template>

		<Button v-else-if="canSave" size="sm" variant="ghost" class="gap-1.5" @click="isNaming = true"> <Icon name="lucide:bookmark-plus" :size="14" /> Save this view </Button>
	</div>
</template>
