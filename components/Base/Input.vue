<script lang="ts" setup>
const {
	id,
	label,
	type,
	required = true,
} = defineProps<{
	id: string;
	label?: string;
	type: string;
	required?: boolean;
}>();

const modelValue = defineModel<string | number>();

const togglePassword = () => {
	const input = document.getElementById(id) as HTMLInputElement;
	if (input.type === "password") input.type = "text";
	else input.type = "password";
};
</script>

<template>
	<label :for="id" class="w-100 d-flex fd-column ai-flex-start jc-center">
		<span v-if="!!label" class="form-label col-grey fw-regular">{{ label }}</span>
		<div class="pos-relative w-100">
			<input :id="id" v-model="modelValue" :type="type" :name="id" :required="required" class="w-100 bg-transparent fw-regular col-grey-2 bordered" />

			<span v-if="type === 'password'" class="eye pos-absolute cursor-pointer" @click="togglePassword">
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
		@include font(1.6rem, 1.9rem);
		margin-bottom: 1.4rem;
	}

	input {
		border-radius: 1.2rem;
		padding: 1.5rem;
		@include font(1.6rem, 1.9rem);
	}
}

[type="date"] {
	background: #fff url(@/assets/images/calendar.svg) 90% 50% no-repeat;
}

[type="date"]::-webkit-inner-spin-button {
	display: none;
}

[type="date"]::-webkit-calendar-picker-indicator {
	opacity: 0;
}
</style>
