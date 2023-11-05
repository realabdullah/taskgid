<script lang="ts" setup>
const {
	value,
	usage = "submit",
	type,
} = defineProps<{
	value: string;
	usage?: "button" | "submit";
	type?: string;
}>();

const background = computed(() => {
	if (type === "danger") return "bg-danger";
	else if (type === "outline") return "bg-transparent outline";
	else return "bg-blue";
});
</script>

<template>
	<button class="__btn w-100 weight-medium col-white self-start" :class="background" :type="usage" :disabled="value === 'loading'">
		<Loader v-if="value === 'loading'" />
		<span v-else>{{ value }}</span>
	</button>
</template>

<style lang="scss" scoped>
.__btn {
	padding: 1.5rem;
	border-radius: 1.2rem;
	@include font(1.6rem, 1.9rem);
	transition: all 0.2s ease-in-out;

	&:hover {
		cursor: pointer;
		opacity: 0.8;
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	&.outline {
		border: 1px solid $col-blue;
		color: $col-blue;
	}
}
</style>
