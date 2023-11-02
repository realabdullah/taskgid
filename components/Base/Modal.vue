<script lang="ts" setup>
const { width, closable = true } = defineProps<{
	width: string;
	closable?: boolean;
}>();

defineEmits(["close-modal"]);
</script>

<template>
	<Transition name="fade" mode="out-in" appear>
		<div class="modal bg-white position-fixed z-9 overflow-auto" :style="`width: ${width};`">
			<button v-if="closable" class="close-modal bg-greyishBlue cursor-pointer position-absolute" @click="$emit('close-modal')">
				<IconsClose />
			</button>

			<slot />
		</div>
	</Transition>
	<Transition name="fade" mode="out-in" appear>
		<div class="modal-overlay position-fixed z-1"></div>
	</Transition>
</template>

<style lang="scss" scoped>
.modal {
	border-radius: 2rem;
	max-width: 100%;
	max-height: 100dvh;
	margin: 0 auto;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	box-shadow: #64646f33 0 0.7rem 2.9rem 0;
	-ms-overflow-style: none;
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}

	.close-modal {
		width: 4.8rem;
		height: 4.8rem;
		border-radius: 50%;
		right: 1rem;
		top: 1rem;
	}
}

.modal-overlay {
	bottom: 0;
	right: 0;
	left: 0;
	top: 0;
	backdrop-filter: blur(0.5rem);
}
</style>
