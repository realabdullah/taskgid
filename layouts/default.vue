<script lang="ts" setup>
import type { User } from "~/types";

const { user } = storeToRefs(useStore());
const getUser = async () => {
	try {
		const { user: res } = await useApiFetch<{ user: User }>("/users/profile", { method: "GET" });
		if (!res) throw new Error("Failed to get user profile");
		user.value = { ...res };
	} catch (error) {
		throw createError({
			statusMessage: String(error),
			fatal: true,
		});
	}
};

onMounted(async () => await getUser());
</script>

<template>
	<div>
		<slot />
	</div>
</template>
