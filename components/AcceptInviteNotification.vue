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
	border: 1.5px solid #e2e2e8;
	box-shadow: #959da533 0px 8px 24px;

	p {
		@include font(1.6rem, 130%);
		color: #66656f;
	}

	a {
		border-radius: 1.4rem;
		border: 1.5px solid #e2e2e8;
		padding: 0.7rem 1.5rem;
		box-shadow: #959da533 0px 8px 24px;
		@include font(1.6rem, 130%);
		color: #66656f;
	}
}
</style>
