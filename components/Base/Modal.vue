<script lang="ts" setup>
const { width, closable = true } = defineProps<{
	width: string;
	closable?: boolean;
}>();

defineEmits(["close-modal"]);
</script>

<template>
	<Transition name="fade" mode="out-in" appear>
		<div class="modal bg-white position-fixed z-9 overflow-auto" :style="`max-width: ${width};`">
			<button v-if="closable" class="close-modal bg-greyishBlue cursor-pointer position-fixed" @click="$emit('close-modal')">
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
	border: 1.5px solid var(--sec-border-color);
	border-radius: 2rem;
	width: 90%;
	max-height: 90vh;
	margin: 0 auto;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	-ms-overflow-style: none;
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}

	.close-modal {
		width: 3rem;
		height: 3rem;
		border: 1.5px solid var(--sec-border-color);
		border-radius: 50%;
		right: 0.5rem;
		top: 0.5rem;
		padding-top: 0.45rem;
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
