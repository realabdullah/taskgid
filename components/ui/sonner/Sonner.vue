<script lang="ts" setup>
import { Toaster as Sonner, type ToasterProps } from "vue-sonner";

const props = defineProps<ToasterProps>();
</script>

<template>
	<Sonner
		class="toaster group"
		v-bind="props"
		position="bottom-right"
		offset="24px"
		:toast-options="{ duration: 4000 }"
		:style="{
			'--normal-bg': 'var(--color-surface-0)',
			'--normal-text': 'var(--color-text-primary)',
			'--normal-border': 'var(--color-border)',
			'--toast-border-radius': 'var(--radius-lg)',
			'z-index': '9999',
		}"
	/>
</template>
