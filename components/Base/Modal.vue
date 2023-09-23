<script lang="ts" setup>
defineProps<{
	width: string;
}>();

defineEmits(["close-modal"]);
</script>

<template>
	<div class="modal" :style="`width: ${width};`">
		<button class="close-modal" @click="$emit('close-modal')">
			<IconsClose />
		</button>

		<slot />
	</div>
	<div class="modal-overlay"></div>
</template>

<style lang="scss" scoped>
.modal {
	background: #ffffff;
	border-radius: 20px;
	max-width: 90%;
	max-height: 90vh;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
	z-index: 9;
	overflow: auto;
	-ms-overflow-style: none;
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}

	.close-modal {
		border: none;
		background: #f6f8fd;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		cursor: pointer;
		position: absolute;
		right: 10px;
		top: 10px;
	}
}

.modal-overlay {
	position: fixed;
	bottom: 0;
	right: 0;
	left: 0;
	top: 0;
	backdrop-filter: blur(5px);
	z-index: 1;
}
</style>
