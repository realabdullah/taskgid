<script lang="ts" setup>
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

defineProps<{
	placeholder?: string;
	name?: string;
	inline?: boolean;
	autoApply?: boolean;
}>();

const date = defineModel<string | Date>();
</script>

<template>
	<VueDatePicker v-model="date" class="taskgid-datepicker" :placeholder="placeholder" :inline="inline" :auto-apply="autoApply" model-type="iso" />
</template>

<style>
.taskgid-datepicker {
	--dp-border-radius: 0;
	--dp-border-color: var(--color-border);
	--dp-input-padding: 0.625rem 0.75rem;
	--dp-font-family: var(--font-body);
}
.taskgid-datepicker .dp__input {
	min-height: 2.5rem;
	text-align: left !important;
	justify-content: flex-start !important;
	padding-left: 2.5rem !important;
	border-color: var(--color-border);
	background: var(--color-surface-0);
	color: var(--color-text-primary);
}
.taskgid-datepicker .dp__input_wrap,
.taskgid-datepicker .dp__main {
	text-align: left !important;
}
.taskgid-datepicker .dp__input::placeholder {
	color: var(--color-text-tertiary);
}
</style>
