<template>
	<span class="loader d-inline-block pos-relative"></span>
</template>

<style lang="scss" scoped>
.loader {
	margin: auto;
	width: 1.6rem;
	height: 1.6rem;
}

.loader::after,
.loader::before {
	content: "";
	width: 2.5rem;
	height: 2.2rem;
	border-radius: 50%;
	border: 0.2rem solid $col-white;
	position: absolute;
	left: 0;
	top: 0;
	animation: animloader 2s linear infinite;
}

.loader::after {
	animation-delay: 1s;
}

@keyframes animloader {
	0% {
		transform: scale(0);
		opacity: 1;
	}

	100% {
		transform: scale(1);
		opacity: 0;
	}
}
</style>
