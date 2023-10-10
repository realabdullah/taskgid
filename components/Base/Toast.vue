<script lang="ts" setup>
const { id } = defineProps<{
	id: string;
	message: string;
}>();

const emit = defineEmits<{
	(event: "close", id: string): void;
}>();

const remaining = ref(5000);
const progress = ref(100);
let timer: ReturnType<typeof setInterval>;

const progressStyle = computed(() => {
	const percent = (remaining.value / 5000) * 100;

	return { width: `${percent}%` };
});

const closeToast = () => {
	clearInterval(timer);
	emit("close", id);
};

const onMouseover = () => clearInterval(timer);

const startTimer = () => {
	timer = setInterval(() => {
		remaining.value -= 1000;
		progress.value -= 20;

		if (remaining.value <= 0) {
			clearInterval(timer);
			closeToast();
		}
	}, 1000);
};

onMounted(() => {
	startTimer();
});

onUnmounted(() => {
	clearInterval(timer);
});
</script>

<template>
	<div class="toast d-flex ai-center jc-space-between w-100 bg-whitishBlue z-9" @mouseover="onMouseover" @mouseleave="startTimer">
		<p class="fw-medium">{{ message }}</p>
		<button class="close-btn bg-transparent cursor-pointer border-none" @click="closeToast">
			<IconsClose />
		</button>

		<div class="progress pos-absolute" :style="progressStyle"></div>
	</div>
</template>

<style lang="scss" scoped>
.toast {
	padding: 2rem 1.5rem;
	border-radius: 0.5rem;
	border: 0.1rem solid #e5e5e5;
	box-shadow: #959da533 0 0.8rem 2.4rem;

	p {
		@include font(1.5rem, 1.8rem);
		margin-bottom: 0.5rem;
	}

	.progress {
		height: 0.5rem;
		background: blue;
		border-radius: 0 0 0.5rem 0.5rem;
		left: 0;
		right: 0;
		bottom: 0;
		transition: width 1s ease-in-out;
	}
}
</style>
