<script lang="ts" setup>
definePageMeta({
	title: "Dashboard",
	name: "dashboard",
	middleware: ["auth"],
});

const { user, tasks, profilePhoto } = storeToRefs(useStore());
const { fetchUserInfo, fetchWorkspaceTasks } = useStore();

const showGetStarted = computed(() => !tasks || tasks.value.length === 0 || profilePhoto.value === "");

await fetchUserInfo();
await fetchWorkspaceTasks();
</script>

<template>
	<NuxtLayout name="dashboard">
		<div class="homepage">
			<div class="homepage-welcome d-flex ai-strech">
				<h1>👋</h1>
				<div class="homepage-welcome__texts d-flex fd-column ai-flex-start">
					<h2 class="fw-semiBold col-black">Hi {{ user.name }},</h2>
					<p class="fw-regular col-grey-2">Wecome to your task management!</p>
				</div>
			</div>

			<div class="motivation-banner d-flex jc-space-between">
				<h4 class="col-white fw-semiBold w-100">Motivation to help you work.</h4>
				<div class="motivation-banner__ctas d-flex fd-column jc-space-between ai-flex-end">
					<IconsClose class="close col-white cursor-pointer" />
					<button class="bg-blue col-white fw-medium cursor-pointer">Get Started</button>
				</div>
			</div>

			<ClientOnly>
				<GetStarted v-if="showGetStarted" />
			</ClientOnly>
		</div>
	</NuxtLayout>
</template>

<style lang="scss" scoped>
.homepage {
	&-welcome {
		@include gap(1.8rem);
		margin-bottom: 3rem;

		h1 {
			@include font(5.6rem, 6.7rem);
		}

		&__texts {
			@include gap(0.8rem);

			h2 {
				@include font(3.6rem, 4.3rem);
			}

			p {
				@include font(2rem, 2.4rem);
			}
		}
	}

	.motivation-banner {
		margin-bottom: 3rem;
		padding: 2.5rem;
		background: linear-gradient(266.06deg, #0f1a4abf 1.1%, #00000060 81.65%, #00000060 109.25%);
		border-radius: 2rem;
		height: 14.6rem;

		h4 {
			max-width: 18.9rem;
			@include font(2.2rem, 2.8rem);
			margin: auto 0;
		}

		&__ctas {
			.close {
				width: 2.4rem;
				height: 2.4rem;
			}

			button {
				border: none;
				width: 15rem;
				height: 4rem;
				border-radius: 1.2rem;
				@include font(1.4rem, 1.7rem);
				box-shadow: #33373a33 0 0.8rem 2.4rem;
			}
		}
	}
}
</style>
