<template>
	<div class="setup__layout bg-white flex items-center w-100">
		<div class="setup__layout-left h-100 flex flex-column content-between">
			<h2 class="setup__text self-center weight-semiBold col-white">Your Enviroment your Will.</h2>
		</div>
		<div class="setup__layout-right w-100">
			<slot />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.setup__layout {
	max-width: 150rem;
	margin: 0 auto;
	height: 100dvh;
	padding: 2rem;
	@include gap(2rem);

	&-left {
		flex-basis: 40%;
		flex-grow: 1;
		background-image: url("~/assets/images/authleft.png");
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		border-radius: 3.2rem;

		@media screen and (max-width: 787px) {
			display: none !important;
		}

		.setup__text {
			@include font(5.6rem, 6.6rem);
			letter-spacing: -0.02em;
			max-width: 45.4rem;
			margin: auto;
			padding: 2rem;
		}
	}

	&-right {
		flex-basis: 60%;
		flex-grow: 1;

		@media screen and (max-width: 787px) {
			flex-basis: 100%;
			padding: 2rem;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
	}
}
</style>
