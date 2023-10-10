<script lang="ts" setup>
const {
	label,
	id,
	required = true,
} = defineProps<{
	label: string;
	id: string;
	required?: boolean;
}>();

defineEmits(["update:modelValue"]);
const modelValue = defineModel<string>();
</script>

<template>
	<label :for="id" class="w-100 d-flex fd-column ai-flex-start pos-relative">
		<span v-if="!!label" class="form-label fw-regular col-darkBlue">{{ label }}</span>
		<textarea :id="id" :name="id" :value="modelValue" :required="required" class="w-100 fw-regular col-grey-2 bordered"></textarea>
	</label>
</template>

<style lang="scss" scoped>
label {
	.form-label {
		@include font(1.6rem, 1.9rem);
		margin-bottom: 1.4rem;
	}

	textarea {
		height: 12rem;
		border-radius: 1.2rem;
		padding: 1.6rem;
		font-family: "Gelion", sans-serif;
		@include font(1.6rem, 1.9rem);
		resize: none;
	}
}
</style>
