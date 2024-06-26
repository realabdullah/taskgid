<script lang="ts" setup>
import "v-calendar/style.css";
import { DatePicker } from "v-calendar";

const { data, mode = "view" } = defineProps<{
	data: Task;
	mode: string;
}>();

const emit = defineEmits<(event: "close") => void>();

const { teams } = storeToRefs(useStore());
const { comments, createNewTask, updateTask, fetchComments, addTaskComment } = useTask();
const push = usePush();

const task = reactive({ ...data });
const usage = ref(mode);
const currentPopup = ref("");
const isSubmitting = ref(false);
const message = ref("");

const taskStatuses = [
	{ key: "Not started", value: "not started" },
	{ key: "In Progress", value: "In Progress" },
	{ key: "Completed", value: "Completed" },
];
const taskPriorities = [
	{ key: "Low Priority", value: "Low" },
	{ key: "Medium Priority", value: "Medium" },
	{ key: "High Priority", value: "High" },
];

const header = computed(() => {
	if (usage.value === "create") return "Create new task";
	else if (usage.value === "edit") return "Editing task...";
	else return "Task details";
});
const sortedComments = computed(() => {
	return comments.value.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

const setMode = (mode: string) => {
	usage.value = usage.value === mode ? "view" : mode;
};

const setPopup = (popup: string) => {
	currentPopup.value = currentPopup.value === popup ? "" : popup;
};

const addNewTask = async () => {
	try {
		isSubmitting.value = true;
		await createNewTask(task);
		emit("close");
		push.success("Task created successfully.");
	} catch (error) {
		isSubmitting.value = false;
		push.error("An error occurred while creating task.");
	}
};

const updateExistingTask = async () => {
	try {
		isSubmitting.value = true;
		await updateTask(task);
		emit("close");
		push.success("Task updated successfully.");
	} catch (error) {
		isSubmitting.value = false;
		push.error("An error occurred while updating task.");
	}
};

const onOutsideClick = (event: MouseEvent) => {
	if (!(event.target as HTMLElement).closest(".popup") && !(event.target as HTMLElement).closest(".toggle")) {
		currentPopup.value = "";
	}
};

onMounted(async () => {
	window.addEventListener("click", onOutsideClick);
	await fetchComments(data._id);
});

onUnmounted(() => {
	window.removeEventListener("click", onOutsideClick);
});
</script>

<template>
	<BaseModal width="70rem" @close-modal="$emit('close')">
		<div class="task bg-white">
			<h3 class="task__header">{{ header }}</h3>
			<div class="task__head flex items-center content-between">
				<input id="title" v-model="task.title" class="task__title w-100 bg-transparent border-none" type="text" placeholder="Title" :disabled="usage === 'view'" />
				<div v-if="usage !== 'create'" class="flex items-center" style="gap: 0.5rem">
					<button class="task__action flex items-center content-center bg-transparent cursor-pointer" @click="setMode('edit')">
						<IconsEdit />
					</button>
					<button class="task__action flex items-center content-center bg-transparent cursor-pointer">
						<IconsMore :bordered="true" />
					</button>
				</div>
			</div>

			<textarea
				id="description"
				v-model="task.description"
				name="description"
				class="task__description w-100 bg-transparent border-none"
				placeholder="Enter task description"
				resize="none"
				:disabled="usage === 'view'"></textarea>

			<ul class="flex flex-column items-start">
				<label class="task__meta flex items-center w-100" for="status">
					<span class="task__meta-title">Status</span>
					<select id="status" v-model="task.status" name="status" class="task__meta-value border-none" :class="[task.status.toLowerCase().replace(' ', '')]" :disabled="usage === 'view'">
						<option v-for="status in taskStatuses" :key="status.key" :value="status.value">{{ status.key }}</option>
					</select>
				</label>
				<label class="task__meta flex items-center w-100" for="status">
					<span class="task__meta-title">Priority</span>
					<select id="priority" v-model="task.priority" name="priority" class="task__meta-value border-none" :class="[task.priority.toLowerCase()]" :disabled="usage === 'view'">
						<option v-for="priority in taskPriorities" :key="priority.key" :value="priority.value">{{ priority.key }}</option>
					</select>
				</label>
				<label class="task__meta flex items-center w-100" for="status">
					<span class="task__meta-title">Assignee</span>
					<select id="assignee" v-model="task.assignee" name="assignee" class="task__meta-value border-none" :disabled="usage === 'view'">
						<option value="">Choose assignee</option>
						<option v-for="member in teams" :key="member.username" :value="member.username">{{ member.name }}</option>
					</select>
				</label>
				<li v-if="usage === 'view'" class="task__meta flex items-center w-100">
					<span class="task__meta-title">Created</span>
					<span class="task__meta-value">{{ formatDate(task.createdAt) }}</span>
				</li>
				<li class="task__meta flex items-center w-100">
					<span class="task__meta-title text-nowrap">Due Date</span>
					<div class="position-relative">
						<span class="task__meta-value date toggle" :class="{ 'cursor-pointer': usage !== 'view' }" @click="usage !== 'view' && setPopup('date')">
							{{ formatDate(task.dueDate) }}
						</span>
						<div v-show="currentPopup === 'date'" class="date popup bg-white position-absolute">
							<DatePicker v-model="task.dueDate" transparent borderless />
						</div>
					</div>
				</li>
				<li v-if="usage === 'view'" class="task__meta flex items-center w-100">
					<span class="task__meta-title text-nowrap">Added by</span>
					<span class="task__meta-value">{{ task.user.name }}</span>
				</li>
			</ul>

			<div v-if="usage !== 'view'" class="task__footer flex w-100">
				<button v-if="usage === 'create'" class="task__footer-button bg-transparent cursor-pointer" @click="addNewTask">Save</button>
				<button v-else class="task__footer-button bg-transparent cursor-pointer" @click="updateExistingTask">Update</button>
			</div>

			<template v-if="usage !== 'create'">
				<p class="comment__header flex items-center">
					Comments
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
						<path
							d="M10 3H14C18.4183 3 22 6.58172 22 11C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3ZM12 17H14C17.3137 17 20 14.3137 20 11C20 7.68629 17.3137 5 14 5H10C6.68629 5 4 7.68629 4 11C4 14.61 6.46208 16.9656 12 19.4798V17Z"
							fill="rgba(100,100,111,1)"></path>
					</svg>
				</p>
				<ul class="comments flex flex-column items-start">
					<li class="w-100 comment box flex flex-column items-start">
						<textarea id="comment" v-model="message" class="w-100 bg-transparent" name="comment" rows="5" placeholder="Add a comment"></textarea>
						<div class="cta">
							<button class="bg-white" :disabled="message.trim() === ''" @click="addTaskComment(task._id, message), (message = '')">Comment</button>
						</div>
					</li>
					<template v-if="sortedComments && sortedComments.length > 0">
						<li v-for="comment in comments" :key="comment._id" class="w-100 comment flex items-start">
							<span class="block date text-nowrap">{{ formatDate(comment.createdAt) }}</span>
							<div class="group flex items-start">
								<img :src="comment.user.profile_picture" :alt="comment.user.username" />
								<div class="content flex flex-column items-start">
									<span class="user text-nowrap">{{ comment.user.firstName + " " + comment.user.lastName }}</span>
									<p class="message">{{ comment.message }}</p>
								</div>
							</div>
						</li>
					</template>
					<p v-else class="empty">No comments on this task yet...</p>
				</ul>
			</template>
		</div>
	</BaseModal>
</template>

<style lang="scss" scoped>
.task {
	padding: 2rem;

	&__header {
		color: var(--text-color);
		margin-bottom: 3rem;
	}

	&__head {
		margin-bottom: 2rem;
		@include gap(2rem);
	}

	input {
		outline: none;

		&:focus {
			border: 0;
			outline: none;
		}
	}

	select {
		outline: none;
		appearance: none;
	}

	&__title {
		@include font(2.4rem, 130%);
		color: var(--text-color);
	}

	&__action {
		border-radius: 1rem;
		padding: 0.5rem 0.8rem;
		box-shadow: var(--box-shadow);
	}

	&__description {
		color: var(--text-color);
		@include font(1.6rem, 130%);
		margin-bottom: 3rem;
		resize: none;
	}

	ul {
		@include gap(1.5rem);

		.task__meta {
			margin-bottom: 1rem;
			@include gap(4rem);

			&-title {
				color: var(--dark);
				@include font(1.6rem, 100%);
				width: 7rem;
			}

			&-value {
				@include font(1.6rem, 100%);
				color: var(--text-color);
			}
		}
	}
	.popup {
		top: 0;
		left: 10rem;
		width: 15rem;
		height: auto;
		border: 1.5px solid var(--sec-border-color);
		border-radius: 1rem;
		padding: 1rem;

		&.date {
			top: unset;
			bottom: 0;
			left: 15rem;
			width: 25rem;
		}
	}

	&__footer {
		margin-top: 3rem;
		@include gap(2rem);

		button {
			@include font(1.4rem, 100%);
			border-radius: 1rem;
			padding: 0.8rem 1.6rem;
			color: var(--text-color);
			box-shadow: var(--box-shadow);
		}
	}

	.comment__header {
		gap: 1rem;
		@include font(1.6rem, 100%);
		margin-top: 2rem;
		border-bottom: 0.1rem solid var(--sec-border-color);
		padding-bottom: 1.5rem;
		color: var(--text-color);
	}

	.comments {
		margin-top: 2.5rem;
		gap: 1.5rem;

		.comment {
			gap: 0.8rem;
			padding-bottom: 1.5rem;

			&:not(:last-child) {
				border-bottom: 0.1rem solid var(--sec-border-color);
			}

			@media screen and (max-width: 600px) {
				flex-direction: column;
			}

			&.box {
				background: var(--main-color);
				border-radius: 0.7rem;
				margin-bottom: 1rem;
				padding-bottom: 0;
				border-bottom: 0;

				textarea {
					border: none;
					resize: none;
					padding: 1rem;
					color: var(--text-color);
					outline: none;
					@include font(1.6rem, 130%);
				}

				.cta {
					align-self: flex-end;
					padding: 0 1rem 1rem;

					button {
						border-radius: 1rem;
						padding: 0.5rem 0.8rem;
						color: var(--text-color);
						box-shadow: var(--box-shadow);
						transition: all 0.2s ease-in-out;

						&:disabled {
							opacity: 0.5;
							cursor: not-allowed;
						}
					}
				}
			}

			.group {
				gap: 1.5rem;
			}

			.date {
				color: var(--dark);
				@include font(1.3rem, 100%);
				margin-right: 2rem;
			}

			img {
				width: 3rem;
				height: 3rem;
				border-radius: 50%;
				box-shadow: var(--box-shadow);
			}

			.content {
				gap: 0.5rem;

				.user {
					color: var(--dark);
					@include font(1.3rem, 100%);
				}

				.message {
					color: var(--text-color);
					@include font(1.5rem, 130%);
				}
			}
		}
	}

	.empty {
		margin-top: 2.5rem;
		@include font(1.5rem, 130%);
		color: var(--text-color);
	}
}

.high {
	color: #f44336;
}

.medium {
	color: #ffc107;
}

.low {
	color: #4caf4f;
}

.inprogress {
	color: #3754db;
}

.notstarted {
	color: #df9a00;
}

.completed {
	color: #4caf4f;
}

[contenteditable="true"] {
	outline: none;
}
</style>
