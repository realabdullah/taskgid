<script setup lang="ts">
const { notifications, showNotifications } = storeToRefs(useStore());

const markAsRead = (index: number) => (notifications.value[index].read = true);
const markAllAsRead = () => notifications.value.forEach((notification) => (notification.read = true));
</script>

<template>
	<div v-if="showNotifications" class="notifications__popup position-absolute bg-white">
		<div class="notifications__popup__header flex items-center content-between">
			<h3 class="weight-bold">Notifications</h3>
			<button v-if="notifications && notifications.length > 0" class="bg-transparent cursor-pointer" @click="markAllAsRead">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
					<path
						d="M11.602 13.7599L13.014 15.1719L21.4795 6.7063L22.8938 8.12051L13.014 18.0003L6.65 11.6363L8.06421 10.2221L10.189 12.3469L11.6025 13.7594L11.602 13.7599ZM11.6037 10.9322L16.5563 5.97949L17.9666 7.38977L13.014 12.3424L11.6037 10.9322ZM8.77698 16.5873L7.36396 18.0003L1 11.6363L2.41421 10.2221L3.82723 11.6352L3.82604 11.6363L8.77698 16.5873Z"></path>
				</svg>
			</button>
		</div>
		<ul v-if="notifications && notifications.length > 0" class="notifications__list overflow-y-auto">
			<li
				v-for="(notificatn, index) in notifications"
				:key="index"
				class="notification flex flex-column items-start content-between w-100 cursor-pointer"
				:class="{ 'notification--read': notificatn.read }"
				@click="markAsRead(index)">
				<p class="notification__message">{{ notificatn.message }}</p>
				<p class="notification__date">{{ notificatn.date }}</p>
			</li>
		</ul>

		<div v-else class="notifications__empty position-relative">
			<p class="notifications__empty-text position-absolute text-center">You have no notifications.</p>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.notifications__popup {
	top: 5rem;
	right: 0;
	width: 30rem;
	border-radius: 1.4rem;
	border: 1.5px solid #e2e2e8;
	box-shadow: #959da533 0px 8px 24px;
	z-index: 100;
	overflow: hidden;

	&__header {
		padding: 1rem;
		border-bottom: 1.5px solid #e2e2e8;

		h3 {
			@include font(1.6rem, 100%);
		}
	}

	.notifications {
		&__list {
			max-height: 50rem;
			-ms-overflow-style: none;
			scrollbar-width: none;

			&::-webkit-scrollbar {
				display: none;
			}

			.notification {
				padding: 1rem;
				font-weight: 500;

				&:not(:last-child) {
					border-bottom: 1.5px solid #e2e2e8;
				}

				&--read {
					background-color: #f8f8f9;
					font-weight: 400;
				}

				&__message {
					@include font(1.4rem, 100%);
					margin-bottom: 0.5rem;
				}

				&__date {
					@include font(1.2rem, 100%);
					color: #a0a0a0;
				}
			}
		}

		&__empty {
			height: 30rem;
			display: flex;
			justify-content: center;
			align-items: center;

			&-text {
				@include font(1.6rem, 100%);
				color: #a0a0a0;
			}
		}
	}
}
</style>
