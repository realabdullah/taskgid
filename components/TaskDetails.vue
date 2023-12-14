<script lang="ts" setup>
import "v-calendar/style.css";
import { DatePicker } from "v-calendar";

const { data, mode = "view" } = defineProps<{
	data: Task;
	mode: string;
}>();

const emit = defineEmits<(event: "close") => void>();

const { teams } = storeToRefs(useStore());
const { createNewTask, updateTask } = useTask();
const push = usePush();

const task = reactive({ ...data });
const usage = ref(mode);
const currentPopup = ref("");
const isSubmitting = ref(false);
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

onMounted(() => {
	window.addEventListener("click", onOutsideClick);
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

			<input
				id="description"
				v-model="task.description"
				class="task__description w-100 bg-transparent border-none"
				type="text"
				placeholder="Enter task description"
				:disabled="usage === 'view'" />

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
