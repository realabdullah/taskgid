<script lang="ts" setup>
const { options, assignees } = defineProps<{
	id: string;
	label: string;
	assignees: string[];
	options: Team[];
}>();
const emit = defineEmits<{
	(event: "update-assignees", value: string[]): void;
}>();

const selected = ref(assignees);
const showOptions = ref(false);

const selectValue = (value: string) => {
	if (selected.value.includes(value)) {
		selected.value = selected.value.filter((item) => item !== value);
	} else {
		selected.value.push(value);
	}
	emit("update-assignees", selected.value);
};

const handleOutsideClick = (event: MouseEvent) => {
	const target = event.target as HTMLElement;
	if (!target.closest(".multiselect")) showOptions.value = false;
};

onMounted(() => {
	document.addEventListener("click", handleOutsideClick);
});

onUnmounted(() => {
	document.removeEventListener("click", handleOutsideClick);
});
</script>

<template>
	<div class="multiselect position-relative">
		<div class="w-100 flex flex-column items-start content-center">
			<span class="form-label col-grey weight-regular">{{ label }}</span>
			<span class="container block w-100 bg-transparent weight-regular col-grey-2 bordered cursor-pointer" @click="showOptions = !showOptions">
				<span v-if="selected.length > 0" class="block w-100 text-capitalize p-1">{{ selected.join(", ") }}</span>
				<span v-else class="block w-100 p-1">Select</span>
			</span>
		</div>

		<div v-show="showOptions" class="multiselect__options position-absolute bg-white w-100 overflow-y-auto z-2">
			<div v-for="option in options" :key="option.username" class="multiselect__options-item flex items-center">
				<span class="d-inline-block w-100 cursor-pointer" @click="selectValue(option.username)">{{ option.name }}</span>
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
