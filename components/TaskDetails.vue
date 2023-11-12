<script lang="ts" setup>
const task = {
	title: "Complete Task Management App",
	description: "Finish building the Task Management app by adding the ability to create, edit, and delete tasks.",
	priority: "High",
	dueDate: "2022-01-31",
	assignees: [
		{
			firstName: "John",
			lastName: "Doe",
			profile_picture: "https://randomuser.me/api/portraits/men/1.jpg",
		},
		{
			firstName: "Jane",
			lastName: "Doe",
			profile_picture: "https://randomuser.me/api/portraits/women/1.jpg",
		},
	],
};
</script>

<template>
	<div class="task bg-white">
		<h3 class="task__tile">{{ task.title }}</h3>
		<p class="task__description">{{ task.description }}</p>
	</div>
</template>

<style lang="scss" scoped>
.task {
	&__header {
		padding: 1rem;
		border-bottom: 1.5px solid #e2e2e8;

		&__left {
			display: flex;
			align-items: center;
			gap: 1rem;
		}

		&__title {
			@include font(2.4rem, 130%);
		}

		&__priority {
			padding: 0.5rem 1rem;
			border-radius: 0.5rem;
			color: #fff;
			font-weight: 500;
			font-size: 1.2rem;
			display: flex;
			align-items: center;
			gap: 0.5rem;

			&.low {
				background-color: #f5f5f5;
				color: #64646f;
			}

			&.medium {
				background-color: #f5f5f5;
				color: #64646f;
			}

			&.high {
				background-color: #f5f5f5;
				color: #64646f;
			}

			&.urgent {
				background-color: #f5f5f5;
				color: #64646f;
			}
		}

		&__right {
			display: flex;
			align-items: center;
			gap: 1rem;
		}

		&__button {
			padding: 0.5rem;
			border-radius: 0.5rem;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.2s ease-in-out;

			&:hover {
				background-color: #f5f5f5;
			}
		}
	}

	&__content {
		padding: 1rem;

		&__description {
			margin-bottom: 1rem;
		}

		&__meta {
			display: flex;
			align-items: center;
			justify-content: space-between;

			&__item {
				display: flex;
				align-items: center;
				gap: 0.5rem;
			}

			&__priority {
				padding: 0.5rem 1rem;
				border-radius: 0.5rem;
				color: #fff;
				font-weight: 500;
				font-size: 1.2rem;
				display: flex;
				align-items: center;
				gap: 0.5rem;
			}

			&__assignees {
				display: flex;
				align-items: center;
				gap: 0.5rem;

				&__image {
					width: 2rem;
					height: 2rem;
					border-radius: 50%;
					object-fit: cover;
				}

				&__button {
					padding: 0.5rem;
					border-radius: 0.5rem;
					display: flex;
					align-items: center;
					justify-content: center;
					transition: all 0.2s ease-in-out;

					&:hover {
						background-color: #f5f5f5;
					}
				}

				&__count {
					padding: 0.5rem 1rem;
					border-radius: 0.5rem;
					color: #fff;
					font-weight: 500;
					font-size: 1.2rem;
					display: flex;
					align-items: center;
					gap: 0.5rem;
				}

				&__dropdown {
					position: relative;

					&__list {
						position: absolute;
						top: 100%;
						left: 0;
						width: 100%;
						background-color: #fff;
						border-radius: 0.5rem;
						box-shadow: 0px 8px 24px rgba(149, 157, 165, 0.2);
						padding: 1rem;
						z-index: 100;
					}

					&__list__item {
						display: flex;
						align-items: center;
						gap: 0.5rem;
						padding: 0.5rem;
						transition: all 0.2s ease-in-out;

						&:hover {
							background-color: #f5f5f5;
						}

						&__image {
							width: 2rem;
							height: 2rem;
							border-radius: 50%;
							object-fit: cover;
						}
					}
				}
			}
		}
	}
}
</style>
