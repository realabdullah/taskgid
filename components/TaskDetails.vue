<script lang="ts" setup>
import "v-calendar/style.css";
import { DatePicker } from "v-calendar";

const { data, mode = "view" } = defineProps<{
	data: Task;
	mode: string;
}>();

const emit = defineEmits<(event: "close") => void>();

const { createNewTask, updateTask } = useTask();
const task = reactive({ ...data });
const usage = ref(mode);
const currentPopup = ref("");
const isSubmitting = ref(false);
const push = usePush();

const header = computed(() => {
	if (usage.value === "create") return "Create new task";
	else if (usage.value === "edit") return "Editing task...";
	else return "Task details";
});

const setMode = (mode: string) => {
	usage.value = usage.value === mode ? "view" : mode;
};

const setPopup = (popup: string) => {
	currentPopup.value = currentPopup.value === popup ? "" : popup;
};

const input = (event: Event) => {
	const el = event.target as HTMLInputElement;
	if (el.id === "title") task.title = el.innerText;
	else if (el.id === "description") task.description = el.innerText;
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
</script>

<template>
	<BaseModal width="70rem" @close-modal="$emit('close')">
		<div class="task bg-white">
			<h3 class="task__header">{{ header }}</h3>
			<div class="task__head flex items-center content-between">
				<h3 id="title" class="task__title" :contenteditable="usage !== 'view'" @input="input">{{ task.title }}</h3>
				<div v-if="usage !== 'create'" class="flex items-center" style="gap: 0.5rem">
					<button class="task__action flex items-center content-center bg-transparent cursor-pointer" @click="setMode('edit')">
						<IconsEdit />
					</button>
					<button class="task__action flex items-center content-center bg-transparent cursor-pointer">
						<IconsMore :bordered="true" />
					</button>
				</div>
			</div>

			<p id="description" class="task__description" :contenteditable="usage !== 'view'" @input="input">{{ task.description }}</p>

			<ul class="flex flex-column items-start">
				<li class="task__meta flex items-center w-100">
					<span class="task__meta-title">Status</span>
					<span
						class="task__meta-value text-capitalize status position-relative"
						:class="[{ 'cursor-pointer': usage !== 'view' }, task.status.toLowerCase().replace(' ', '')]"
						@click="usage !== 'view' && setPopup('status')">
						{{ task.status }}
						<div v-show="currentPopup === 'status'" class="status popup bg-white position-absolute">
							<ul class="flex flex-column items-start">
								<li class="status__item flex items-center cursor-pointer col-grey-3" @click="task.status = 'not started'">
									<span class="status__item-value">Not Started</span>
								</li>
								<li class="status__item flex items-center cursor-pointer col-grey-3" @click="task.status = 'In Progress'">
									<span class="status__item-value">In Progress</span>
								</li>
								<li class="status__item flex items-center cursor-pointer col-grey-3" @click="task.status = 'Completed'">
									<span class="status__item-value">Completed</span>
								</li>
							</ul>
						</div>
					</span>
				</li>
				<li class="task__meta flex items-center w-100">
					<span class="task__meta-title">Priority</span>
					<span
						class="task__meta-value priority position-relative"
						:class="[task.priority.toLowerCase(), { 'cursor-pointer': usage !== 'view' }]"
						@click="usage !== 'view' && setPopup('priority')">
						{{ task.priority }}
						<div v-show="currentPopup === 'priority'" class="priority popup bg-white position-absolute">
							<ul class="flex flex-column items-start">
								<li class="priority__item flex items-center cursor-pointer" @click="task.priority = 'High'">
									<span class="priority__item-value high">High</span>
								</li>
								<li class="priority__item flex items-center cursor-pointer" @click="task.priority = 'Medium'">
									<span class="priority__item-value medium">Medium</span>
								</li>
								<li class="priority__item flex items-center cursor-pointer" @click="task.priority = 'Low'">
									<span class="priority__item-value low">Low</span>
								</li>
							</ul>
						</div>
					</span>
				</li>
				<li class="task__meta flex items-center w-100">
					<span class="task__meta-title">Assignees</span>
					<div class="task__meta-value">
						<span v-for="(assignee, index) in task.assignees" :key="index">{{ assignee + (index !== task.assignees.length - 1 ? ", " : ".") }}</span>
					</div>
				</li>
				<li class="task__meta flex items-center w-100">
					<span class="task__meta-title">Created</span>
					<span class="task__meta-value">{{ formatDate(task.createdAt) }}</span>
				</li>
				<li class="task__meta flex items-center w-100">
					<span class="task__meta-title">Due Date</span>
					<span class="task__meta-value date position-relative" :class="{ 'cursor-pointer': usage !== 'view' }" @click="usage !== 'view' && setPopup('date')">
						{{ formatDate(task.dueDate) }}
						<div v-show="currentPopup === 'date'" class="date popup bg-white position-absolute">
							<DatePicker v-model="task.dueDate" transparent borderless />
						</div>
					</span>
				</li>
				<li class="task__meta flex items-center w-100">
					<span class="task__meta-title">Added by</span>
					<span class="task__meta-value">{{ task.user.name }}</span>
				</li>
			</ul>

			<div v-if="usage !== 'view'" class="task__footer flex w-100">
				<button v-if="usage === 'create'" class="task__footer-button bg-transparent cursor-pointer" @click="addNewTask">Save</button>
				<button v-else class="task__footer-button bg-transparent cursor-pointer" @click="updateExistingTask">Update</button>
			</div>
		</div>
	</BaseModal>
</template>

<style lang="scss" scoped>
.task {
	padding: 2rem;

	&__header {
		margin-bottom: 3rem;
	}

	&__head {
		margin-bottom: 2rem;
		@include gap(2rem);
	}

	&__title {
		@include font(2.4rem, 130%);
	}

	&__action {
		border: 1.5px solid #e2e2e8;
		border-radius: 1rem;
		padding: 0.5rem 0.8rem;
		box-shadow: #959da533 0px 8px 24px;
	}

	&__description {
		@include font(1.6rem, 130%);
		margin-bottom: 3rem;
	}

	ul {
		@include gap(1.5rem);

		.task__meta {
			margin-bottom: 1rem;
			@include gap(4rem);

			&-title {
				color: #64646f;
				@include font(1.6rem, 100%);
				width: 7rem;
			}

			&-value {
				@include font(1.6rem, 100%);

				&.priority {
					color: #66656f;
					padding: 0.5rem 2rem 0.7rem;
					border-radius: 1.4rem;
					@include font(1.4rem, 100%);
				}
			}
		}
	}
	.popup {
		top: 0;
		left: 10rem;
		width: 15rem;
		height: auto;
		border: 1.5px solid #e2e2e8;
		border-radius: 1rem;
		padding: 1rem;

		&.date {
			top: unset;
			bottom: 0;
			left: 15rem;
			width: 25rem;
		}
	}

	.status {
		&__item {
			&-value {
				padding: 0.5rem 1rem 0.7rem;
				border-radius: 1.4rem;
				@include font(1.4rem, 100%);
			}
		}
	}

	.priority__item {
		&-value {
			padding: 0.5rem 2rem 0.7rem;
			border-radius: 1.4rem;
			@include font(1.4rem, 100%);
		}
	}

	&__footer {
		margin-top: 3rem;
		@include gap(2rem);

		button {
			@include font(1.4rem, 100%);
			border: 1.5px solid #e2e2e8;
			border-radius: 1rem;
			padding: 0.8rem 1.6rem;
			box-shadow: #959da533 0px 8px 24px;
		}
	}
}

.high {
	background-color: #f4433662;
}

.medium {
	background-color: #ffc10773;
}

.low {
	background-color: #4caf4f58;
}

.inprogress {
	padding: 0.5rem 1rem;
	background: #f2f4fd;
	color: #3754db;
}

.notstarted {
	padding: 0.5rem 1rem;
	background: #fffdf5;
	color: #df9a00;
}

.completed {
	padding: 0.5rem 1rem;
	background: #f2fdf5;
	color: #4caf4f;
}

[contenteditable="true"] {
	outline: none;
}
</style>
