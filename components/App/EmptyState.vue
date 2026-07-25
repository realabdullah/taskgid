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
	<div class="bg-surface-0 flex flex-col items-center justify-center rounded-xl px-6 py-20 text-center shadow-xs">
		<div class="bg-accent-subtle text-primary flex h-14 w-14 items-center justify-center rounded-2xl">
			<Icon :name="props.icon" :size="24" aria-hidden="true" />
		</div>
		<p v-if="props.subheading" class="text-text-tertiary mt-6 text-sm font-semibold">{{ props.subheading }}</p>
		<p class="text-text-primary mt-2 text-3xl font-extrabold tracking-[-0.035em]">{{ props.heading }}</p>
		<p class="text-text-secondary mt-3 max-w-sm text-sm leading-6">{{ props.body }}</p>
		<Button v-if="props.action" :variant="props.action.variant ?? 'primary'" class="mt-6" @click="props.action.onClick">{{ props.action.label }}</Button>
	</div>
</template>
