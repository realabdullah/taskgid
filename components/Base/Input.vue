<script lang="ts" setup>
interface InputTextProps {
	labelFor?: string;
	label?: string;
	inputType: string;
	placeholder?: string;
	hint?: string;
	required?: boolean;
	borderColor?: string;
}

const { labelFor } = defineProps<InputTextProps>();
const modelValue = defineModel<string | number>();

const togglePassword = () => {
	const input = document.getElementById(labelFor!) as HTMLInputElement;
	if (input.type === "password") input.type = "text";
	else input.type = "password";
};
</script>

<template>
	<label :for="labelFor">
		<span v-if="!!label" class="form-label">{{ label }}</span>
		<input :id="labelFor" v-model="modelValue" :type="inputType" :name="labelFor" :placeholder="placeholder" :required="required" :style="`border: 0.6px solid ${borderColor};`" />
		<span v-if="!!hint" class="form-hint">{{ hint }}</span>

		<span v-if="inputType === 'password'" class="eye" @click="togglePassword">
			<IconsEye />
		</span>
	</label>
</template>

<style lang="scss" scoped>
label {
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: flex-start;
	position: relative;

	&:not(:last-child) {
		margin-bottom: 24px;
	}

	.eye {
		position: absolute;
		right: 15px;
		top: 50%;
		transform: translateY(-25%);
		cursor: pointer;
	}

	.form-label {
		font-weight: 400;
		font-size: 16px;
		line-height: 19px;
		color: #2c2e3a;
		margin-bottom: 14px;
	}

	input {
		width: -webkit-fill-available;
		background: transparent;
		border-radius: 12px;
		padding: 15px;
		font-weight: 400;
		font-size: 16px;
		line-height: 19px;
		color: #13236c;
		margin-bottom: 8px;

		&::placeholder {
			color: #13236c;
		}
	}

	.form-hint {
		font-weight: 400;
		font-size: 12px;
		line-height: 14px;
		color: #6e7391;
		display: block;
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
