<script lang="ts" setup>
const emit = defineEmits(["open-modal", "edit", "delete"]);

const task = defineModel() as Ref<Task>;

const showOptions = ref(false);

const shortenTextToSummary = (text: string) => {
	if (text.length <= 200) {
		return text;
	} else {
		const truncatedText = text.substring(0, 200 - 3).trim() + "...";
		return truncatedText;
	}
};

const onCardClick = () => {
	if (showOptions.value) {
		showOptions.value = false;
		return;
	}
	emit("open-modal");
};
</script>

<template>
	<li class="task bg-white cursor-pointer flex flex-column content-between position-relative" @click="onCardClick">
		<div class="flex flex-column">
			<div class="flex items-center content-between position-relative">
				<h3 class="task__title">{{ task.title }}</h3>
				<button class="task__action bg-transparent cursor-pointer" @click.stop="showOptions = !showOptions">
					<IconsMore />
				</button>

				<div v-show="showOptions" class="task__options-popup bg-white position-absolute z-1" style="top: 3rem; right: 0" @click.stop>
					<button class="w-100 text-left bg-transparent cursor-pointer" @click="$emit('edit')">Edit</button>
					<button class="w-100 text-left bg-transparent cursor-pointer" @click="$emit('delete')">Delete</button>
				</div>
			</div>
			<p class="task__description">{{ shortenTextToSummary(task.description) }}</p>
		</div>

		<div class="task__meta flex items-center content-between">
			<span class="task__meta-item flex items-center" style="gap: 0.5rem">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
					<path
						d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 11H4V19H20V11ZM7 5H4V9H20V5H17V7H15V5H9V7H7V5Z"
						fill="rgba(102,101,111,1)"></path>
				</svg>
				{{ formatDate(task.dueDate) }}
			</span>
			<div class="status task__meta-item text-capitalize">{{ task.status }}</div>
		</div>

		<span class="task__meta-priority position-absolute" :class="task.priority.toLowerCase()">{{ task.priority }}</span>
	</li>
</template>

<style lang="scss" scoped>
.task {
	padding: 1.6rem;
	padding-top: 6rem;
	border-radius: 1.4rem;
	@include gap(1.2rem);
	box-shadow: var(--box-shadow);

	&__title {
		color: var(--dark);
		@include font(1.6rem, 130%);
	}

	&__action {
		color: var(--sec-border-color);
		width: 2rem;
		height: 2rem;
	}

	&__options-popup {
		width: 15rem;
		top: 4rem;
		right: 0;
		border-radius: 1.4rem;
		box-shadow: var(--box-shadow);
		transition: all 0.3s ease-in-out;
		z-index: 9;

		button {
			@include font(1.4rem, 100%);
			color: var(--dark);
			padding: 1rem 2rem;
			transition: all 0.3s ease-in-out;

			&:hover {
				background-color: var(--sec-border-color);

				&:first-child {
					border-top-left-radius: 1.4rem;
					border-top-right-radius: 1.4rem;
				}

				&:last-child {
					border-bottom-left-radius: 1.4rem;
					border-bottom-right-radius: 1.4rem;
				}
			}
		}
	}

	&__description {
		max-width: 60rem;
		margin-top: 1.5rem;
		color: var(--text-color);
		@include font(1.4rem, 100%);
	}

	&__meta {
		margin-top: 2.5rem;
		@include gap(1.2rem);

		&-item {
			color: var(--text-color);
			@include font(1.4rem, 100%);
		}

		&-priority {
			top: 1.5rem;
			right: 1.5rem;
			color: var(--text-color);
			padding: 0.5rem 2rem 0.7rem;
			border-radius: 1.4rem;
			@include font(1.4rem, 100%);

			&.high {
				background-color: #f4433662;
			}

			&.medium {
				background-color: #ffc10773;
			}

			&.low {
				background-color: #4caf4f58;
			}
		}
	}
}
</style>
