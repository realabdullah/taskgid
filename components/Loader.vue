<template>
	<span class="loader inline-block position-relative"></span>
</template>

<style lang="scss" scoped>
.loader {
	width: 1.2rem;
	height: 1.2rem;
	border-radius: 50%;
	background-color: #fff;
	box-shadow:
		24px 0 #fff,
		-24px 0 #fff;
	position: relative;
	animation: flash 0.5s ease-out infinite alternate;
}

@keyframes flash {
	0% {
		background-color: #fff2;
		box-shadow:
			24px 0 #fff2,
			-24px 0 #fff;
	}
	50% {
		background-color: #fff;
		box-shadow:
			24px 0 #fff2,
			-24px 0 #fff2;
	}
	100% {
		background-color: #fff2;
		box-shadow:
			24px 0 #fff,
			-24px 0 #fff2;
	}
}
</style>
