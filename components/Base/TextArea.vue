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
	<label :for="id" class="w-100 flex flex-column items-start position-relative">
		<span v-if="!!label" class="form-label weight-regular col-text">{{ label }}</span>
		<textarea :id="id" v-model="modelValue" :name="id" :required="required" class="w-100 weight-regular bordered"></textarea>
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
		font-family: "Amulya", sans-serif;
		@include font(1.6rem, 1.9rem);
		color: var(--text-color);
		resize: none;
	}
}
</style>
