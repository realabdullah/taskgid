<script lang="ts" setup>
const { options } = defineProps<{
	id: string;
	label: string;
	options: { id: string; label: string }[];
}>();

const selected = ref([]);
const showOptions = ref(false);
const modelValue = defineModel<string[]>();

const selectValue = (value: string) => {
	const index = modelValue.value?.indexOf(value) as number;
	const optionIndex = options.findIndex((option) => option.id === value);
	if (index !== -1) {
		modelValue.value?.splice(index, 1);
		selected.value.splice(optionIndex, 1);
	} else {
		modelValue.value?.push(value);
		selected.value.push(options[optionIndex].label);
	}
};

const handleOutsideClick = (event: MouseEvent) => {
	const target = event.target as HTMLElement;
	if (!target.closest(".multiselect")) showOptions.value = false;
};

onMounted(() => {
	if (modelValue.value?.length !== 0) {
		modelValue.value?.forEach((value) => {
			const optionIndex = options.findIndex((option) => option.id === value);
			selected.value.push(options[optionIndex].label);
		});
	}
	document.addEventListener("click", handleOutsideClick);
});

onUnmounted(() => {
	document.removeEventListener("click", handleOutsideClick);
});
</script>

<template>
	<div class="multiselect pos-relative">
		<div class="w-100 d-flex fd-column ai-flex-start jc-center">
			<span class="form-label col-grey fw-regular">{{ label }}</span>
			<span class="container d-block w-100 bg-transparent fw-regular col-grey-2 bordered cursor-pointer" @click="showOptions = !showOptions">
				<span v-if="selected.length === 0" class="d-block w-100 p-1">Select</span>
				<span v-else class="d-block w-100 p-1">{{ selected.join(", ") }}</span>
			</span>
		</div>

		<div v-show="showOptions" class="multiselect__options pos-absolute bg-white w-100 overflow-y-auto z-2">
			<div v-for="(option, index) in options" :key="index" class="multiselect__options-item d-flex ai-center">
				<span class="d-inline-block w-100 cursor-pointer" @click="selectValue(option.id)">{{ option.label }}</span>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.multiselect {
	@include font(1.6rem, 1.9rem);

	.form-label {
		margin-bottom: 1.4rem;
	}

	.container {
		border-radius: 1.2rem;
		padding: 1.5rem;
	}

	&__options {
		border-radius: 1.2rem;
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
		max-height: 20rem;

		&-item {
			padding: 1.5rem;
			border-bottom: 1px solid #e0e0e0;

			&:last-child {
				border-bottom: none;
			}

			input {
				margin-right: 1rem;
			}
		}
	}
}
</style>
