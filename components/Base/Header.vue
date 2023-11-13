<script lang="ts" setup>
const { allNotificationsRead, showNotifications } = storeToRefs(useStore());
</script>

<template>
	<header class="flex items-center content-between">
		<label for="search" class="search position-relative w-100">
			<input id="search" class="w-100 bg-transparent" type="search" name="search" placeholder="Search your space here..." />
			<IconsSearch class="search-icon position-absolute cursor-pointer" />
		</label>

		<div class="flex items-center position-relative" style="gap: 1.2rem">
			<button class="bg-transparent cursor-pointer">
				<IconsUser :active="false" />
			</button>
			<button class="bg-transparent cursor-pointer" @click="showNotifications = !showNotifications">
				<IconsNotificationBell :notification="!allNotificationsRead" />
			</button>

			<Notifications />
		</div>
	</header>
</template>

<style lang="scss" scoped>
header {
	margin-bottom: 5rem;

	.search {
		max-width: 35rem;

		input {
			height: 5rem;
			border: 1.5px solid #e2e2e8;
			border-radius: 1.2rem;
			padding: 1.6rem;
		}

		&-icon {
			top: 50%;
			transform: translate(0, -50%);
			right: 1.5rem;
		}
	}
}
</style>
