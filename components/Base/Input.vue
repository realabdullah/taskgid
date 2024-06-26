<script lang="ts" setup>
const {
	id,
	label,
	type,
	required = false,
} = defineProps<{
	id: string;
	label?: string;
	type: string;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	errors?: any[];
}>();

const modelValue = defineModel<string | number>();

const togglePassword = () => {
	const input = document.getElementById(id) as HTMLInputElement;
	if (input.type === "password") input.type = "text";
	else input.type = "password";
};
</script>

<template>
	<label :for="id" class="w-100 flex flex-column items-start content-center">
		<span v-if="!!label" class="w-100 form-label weight-medium flex items-center content-between">
			{{ label }}
			<template v-if="errors && errors.length > 0">
				<span v-for="error in errors" :key="error.$uid" class="error weight-regular">{{ error.$message }}</span>
			</template>
		</span>
		<div class="position-relative w-100">
			<input
				:id="id"
				v-model="modelValue"
				:type="type"
				:name="id"
				:required="required"
				class="w-100 bg-transparent weight-regular"
				:class="{ error: errors && errors.length > 0 }"
				:placeholder="placeholder"
				:disabled="disabled" />

			<span v-if="type === 'password'" class="eye position-absolute cursor-pointer" @click="togglePassword">
				<IconsEye />
			</span>
		</div>
	</label>
</template>

<style lang="scss" scoped>
label {
	.eye {
		right: 1.5rem;
		top: 50%;
		transform: translate(0, -50%);
	}

	.form-label {
		@include font(1.4rem, 140%);
		margin-bottom: 0.6rem;
		color: var(--text-color);
	}

	input {
		color: var(--text-color);
		border-radius: 0.8rem;
		border: 1.5px solid var(--sec-border-color);
		padding: 0.8rem 1.2rem;
		@include font(1.6rem, 150%);

		&.error {
			border-color: #d92d20;
		}

		&:focus {
			outline: none;
		}

		&:disabled {
			cursor: not-allowed;
			background-color: var(--main-color);
		}
	}

	.error {
		color: #d92d20;
		@include font(1.4rem, 140%);
	}
}

[type="date"] {
	background: var(--white) url(@/assets/images/calendar.svg) 90% 50% no-repeat;
}

[type="date"]::-webkit-inner-spin-button {
	display: none;
}

[type="date"]::-webkit-calendar-picker-indicator {
	opacity: 0;
}
</style>
