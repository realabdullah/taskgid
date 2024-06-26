<script lang="ts" setup>
import type { NotivueItem } from "notivue";

export interface AcceptInviteNotificationProps {
	url: string;
}

defineProps<{
	item: NotivueItem<AcceptInviteNotificationProps>;
}>();
</script>

<template>
	<div class="bg-white accept__toast Wrapper">
		<div class="Content flex flex-column items-start" style="gap: 2rem">
			<p>{{ item.message }}</p>
			<a :href="item.props.url" class="text-unset cursor-pointer">Accept Invitation</a>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.accept__toast {
	width: 40rem;
	padding: 1.5rem;
	border-radius: 1.4rem;
	box-shadow: var(--box-shadow);

	p {
		@include font(1.6rem, 130%);
		color: var(--text-color);
	}

	a {
		border-radius: 1.4rem;
		padding: 0.7rem 1.5rem;
		box-shadow: var(--box-shadow);
		@include font(1.6rem, 130%);
		color: var(--text-color);
	}
}
</style>
