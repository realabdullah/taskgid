<script lang="ts" setup>
defineComponent({ name: "Toast" });

interface Toast {
	toastStyle: string;
	type: string;
	message: string;
	description: string;
}

const props = defineProps<Toast>();

const borderColor = ref("");
const color = ref("");

type ColorMap = {
	[key in string]: [string, string];
};

const background = computed(() => {
	const colorMap: ColorMap = {
		success: ["#00C271", "#FAFFFD"],
		error: ["#F7002B", "#FFFAFB"],
		warning: ["#FBBE37", "#FFFAFB"],
		info: ["#6684FF", "#FBFCFF"],
	};
	if (props.toastStyle === "solid" || props.toastStyle === "outline") {
		const [bgColor, border] = colorMap[props.type];
		borderColor.value = border;
		color.value = "#FFFFFF";
		if (props.toastStyle === "outline") {
			color.value = bgColor;
			borderColor.value = bgColor;
		}
		return bgColor;
	}
});
</script>

<template>
	<div class="toast d-flex ai-center pos-fixed w-100" :style="`border: ${toastStyle === 'outline' ? `1.6px solid ${borderColor}` : 'none'}; color: ${color}; background: ${background}`">
		<div class="toast__icon">
			<IconsAlert :type="type" />
		</div>
		<div class="toast__content d-flex fd-column ai-flex-start">
			<p class="fw-medium">{{ message }}</p>
			<span class="fw-light">{{ description }}</span>
		</div>
		<button class="close-btn bg-transparent pos-absolute cursor-pointer">
			<IconsClose />
		</button>
	</div>
</template>

<style lang="scss" scoped>
.toast {
	max-width: 35rem;
	padding: 2rem;
	border-radius: 2rem;
	top: 4rem;
	left: 4rem;

	&__icon {
		margin-right: 2rem;
		background: #ffffff26;
		padding: 1.3rem;
		border-radius: 50%;
	}

	&__content {
		p {
			@include font(1.8rem, 2.2rem);
			margin-bottom: 0.5rem;
		}

		span {
			@include font(1.2rem, 1.4rem);
		}
	}

	.close-btn {
		border: none;
		right: 2rem;
		top: 2rem;
		color: v-bind(color);
	}
}
</style>
