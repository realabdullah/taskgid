<script lang="ts" setup>
const messages = ref<
	{
		text: string;
		id: string;
	}[]
>([]);

onMounted(() =>
	useListen("toast", (text) => {
		messages.value.push({ text, id: Math.random().toString(36).substring(2, 9) });
	}),
);

const removeToast = (id: string) => {
	const index = messages.value.findIndex((message) => message.id === id);
	messages.value.splice(index, 1);
};
</script>

<template>
	<div v-if="messages.length > 0" class="toast-container w-100 flex flex-column position-fixed">
		<BaseToast v-for="message in messages" :id="message.id" :key="message.id" :message="message.text" @close="removeToast" />
	</div>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>

<style lang="scss" scoped>
.toast-container {
	@include gap(1rem);
	max-width: 30rem;
	top: 2rem;
	right: 2rem;
	z-index: 9999;
}
</style>
