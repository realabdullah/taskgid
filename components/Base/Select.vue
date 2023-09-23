<script lang="ts" setup>
const props = defineProps<{
	label: string;
	lists: [] | string[];
	selectedValue?: string;
}>();

const emit = defineEmits(["selected"]);

const selectedOption = ref("");
const selectOption = (option: string) => {
	selectedOption.value = option;
	emit("selected", option);
	closeDetailAndSummary();
};

const closeDetailAndSummary = () => {
	const details = document.querySelector("details");
	const summary = document.querySelector("summary");

	if (details && summary) {
		details.removeAttribute("open");
		summary.removeAttribute("aria-expanded");
	}
};

onMounted(() => {
	selectedOption.value = props.selectedValue ?? "";
});
</script>

<template>
	<div class="select-menu">
		<span class="label">{{ label }}</span>
		<details class="dropdown">
			<summary class="dropdown-input">
				<span class="dropdown-input__label">{{ selectedOption || "Select task priority" }}</span>
				<span class="dropdown-input__arrow"></span>
			</summary>
			<div class="dropdown__modal">
				<div class="dropdown__modal-options">
					<button v-for="(option, index) in lists" :key="index" :class="{ active: selectedOption === option }" type="button" @click="selectOption(option)">{{ option }}</button>
				</div>
			</div>
		</details>
	</div>
</template>

<style lang="scss" scoped>
.select-menu {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: flex-start;

	.label {
		display: block;
		margin-bottom: 14px;
		font-weight: 400;
		font-size: 16px;
		line-height: 19px;
		color: #2c2e3a;
	}

	.dropdown {
		width: 100%;
		position: relative;

		&-input {
			outline: none;
			border: 0.7px solid #a8abbd;
			border-radius: 12px;
			padding: 15px;
			background: transparent;
			font-weight: 400;
			font-size: 16px;
			line-height: 19px;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: space-between;

			&__arrow {
				display: inline-block;
				width: 0;
				height: 0;
				vertical-align: middle;
				content: "";
				border-style: solid;
				border-width: 4px 4px 0;
				border-right-color: transparent;
				border-bottom-color: transparent;
				border-left-color: transparent;
			}
		}

		&__modal {
			position: absolute;
			top: 60px;
			left: 0;
			right: 0;
			background: #ffffff;
			box-shadow: 0px 12px 40px rgba(179, 179, 179, 0.1);
			border-radius: 16px;
			z-index: 99;

			&-options {
				padding: 25px 20px;
				display: flex;
				flex-direction: column;
				gap: 12px;

				button {
					border: none;
					background: transparent;
					border-radius: 12px;
					padding: 15px;
					font-weight: 400;
					font-size: 16px;
					line-height: 19px;
					color: #000000;
					text-align: left;
					cursor: pointer;

					&:hover {
						background: #f6f8fd;
					}
				}

				.active {
					background: #f6f8fd;
				}
			}
		}

		&[open] {
			.dropdown-input {
				border: 1.3px solid #3754db;
				color: #3754db;
			}
		}
	}
}
</style>
