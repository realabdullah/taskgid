<script lang="ts" setup>
const { id, label, lists } = defineProps<{
	id: string;
	label: string;
	lists: [] | string[];
}>();

const modelValue = defineModel<string | number>();
</script>

<template>
	<label class="w-100 flex flex-column items-start" :for="id">
		<span class="label block weight-regular col-text">{{ label }}</span>

		<select :id="id" v-model="modelValue" :name="id" class="w-100 bg-transparent weight-regular bordered" required>
			<option v-for="option in lists" :key="option" class="text-capitalize" :value="option">{{ option }}</option>
		</select>
	</label>
</template>

<style lang="scss" scoped>
.label {
	@include font(1.6rem, 1.9rem);
	margin-bottom: 1.4rem;
}

select {
	border-radius: 1.2rem;
	padding: 1.5rem;
	@include font(1.6rem, 1.9rem);
	color: var(--text-color);
}
</style>
