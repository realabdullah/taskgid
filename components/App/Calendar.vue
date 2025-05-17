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
	<VueDatePicker v-model="date" :placeholder="placeholder" :inline="inline" :auto-apply="autoApply" model-type="iso" />
</template>
