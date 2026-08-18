<script setup lang="ts">
import type { Tag } from "~/types";

const props = withDefaults(defineProps<{ tag: Tag; removable?: boolean; size?: "sm" | "md" }>(), { removable: false, size: "sm" });
defineEmits<{ remove: [tag: Tag] }>();

// The stored colour is arbitrary and cannot be trusted for text contrast, so it
// only ever paints the dot. The chip itself uses design tokens.
const dotColor = computed(() => (/^#[0-9a-f]{3,8}$/i.test(props.tag.color) ? props.tag.color : "var(--color-text-tertiary)"));
</script>

<template>
	<span
		class="border-border bg-surface-0 text-text-secondary inline-flex max-w-full items-center gap-1.5 rounded-full border font-medium"
		:class="size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'"
	>
		<span class="size-2 shrink-0 rounded-full" :style="{ backgroundColor: dotColor }" aria-hidden="true" />
		<span class="truncate">{{ tag.name }}</span>
		<Button v-if="removable" type="button" variant="ghost" size="icon" static class="-me-1 size-4 shrink-0 rounded-full" @click.stop="$emit('remove', tag)">
			<Icon name="lucide:x" :size="10" />
			<span class="sr-only">Remove {{ tag.name }}</span>
		</Button>
	</span>
</template>
