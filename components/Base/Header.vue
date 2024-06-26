<script lang="ts" setup>
const { allNotificationsRead, showNotifications } = storeToRefs(useStore());
const { logout } = useToken();

const showPopup = ref(false);

const onOutsideClick = (event: MouseEvent) => {
	if (!(event.target as HTMLElement).closest(".logout-popup") && !(event.target as HTMLElement).closest(".account")) {
		showPopup.value = false;
	}
};

onMounted(() => {
	window.addEventListener("click", onOutsideClick);
});

onUnmounted(() => {
	window.removeEventListener("click", onOutsideClick);
});
</script>

<template>
	<header class="flex items-center content-between">
		<label for="search" class="search position-relative w-100">
			<input id="search" class="w-100 bg-transparent" type="search" name="search" placeholder="Search your space here..." />
			<IconsSearch class="search-icon position-absolute cursor-pointer" />
		</label>

		<div class="flex items-center position-relative" style="gap: 1.2rem">
			<div class="position-relative">
				<button class="account bg-transparent cursor-pointer" @click="showPopup = !showPopup">
					<IconsUser :active="false" />
				</button>

				<div v-show="showPopup" class="logout-popup position-absolute">
					<button class="bg-transparent cursor-pointer" @click="logout">Logout</button>
				</div>
			</div>
			<button class="bg-transparent cursor-pointer" @click="showNotifications = !showNotifications">
				<IconsNotificationBell :notification="!allNotificationsRead" />
			</button>

			<NotificationBoard />
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
			border: 1.5px solid var(--sec-border-color);
			border-radius: 1.2rem;
			padding: 1.6rem;
			outline: none;
		}

		&-icon {
			top: 50%;
			transform: translate(0, -50%);
			right: 1.5rem;
		}
	}

	.logout-popup {
		top: 4rem;
		right: 0;
		border-radius: 1.4rem;
		padding: 0.7rem 1.5rem;
		box-shadow: var(--box-shadow);
		transition: all 0.3s ease-in-out;

		button {
			@include font(1.4rem, 100%);
			color: var(--text-color);
			padding: 0.5rem 0;
			width: 100%;
		}
	}
}
</style>
