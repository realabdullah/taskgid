<script lang="ts" setup>
type EmptyStateAction = {
	label: string;
	onClick: () => void;
	variant?: "primary" | "secondary";
};

const props = withDefaults(
	defineProps<{
		heading: string;
		subheading?: string;
		body: string;
		icon?: string;
		action?: EmptyStateAction;
	}>(),
	{
		subheading: "Nothing here yet",
		icon: "hugeicons:folder-02",
	}
);
</script>

<template>
	<div class="border-border bg-surface-0 flex flex-col items-center justify-center rounded-lg border px-6 py-12 text-center">
		<Icon :name="props.icon" :size="48" class="text-text-tertiary" aria-hidden="true" />
		<p v-if="props.subheading" class="text-2xs text-text-tertiary mt-4 font-semibold tracking-[0.12em] uppercase">{{ props.subheading }}</p>
		<p class="text-text-primary mt-4 text-lg font-semibold">{{ props.heading }}</p>
		<p class="text-text-secondary mt-2 max-w-xs text-sm">{{ props.body }}</p>
		<Button v-if="props.action" :variant="props.action.variant ?? 'primary'" class="mt-6" @click="props.action.onClick">{{ props.action.label }}</Button>
	</div>
</template>
