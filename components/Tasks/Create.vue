<script lang="ts" setup>
const props = defineProps<{
    usage: string;
    taskToBeUpdated?: Task;
}>();

const { user, tasks } = storeToRefs(useStore());
const { fetchTasks } = useStore();
const { addUserTask, updateUserTask } = useTasks();

const priorities = ["Less Important", "Important", "High Priority"];
const title = ref("");
const description = ref("");
const dueDate = ref();
const priority = ref("");
const status = ref("Pending");
const submitting = ref(false);

const updatePriority = (value: string) => {
    priority.value = value;
};
const emit = defineEmits(["close", "success"]);

if (props.usage === "update") {
    title.value = props.taskToBeUpdated?.title ?? "";
    description.value = props.taskToBeUpdated?.description ?? "";
    dueDate.value = props.taskToBeUpdated?.dueDate ?? "";
    updatePriority(props.taskToBeUpdated?.priority ?? "");
    status.value = props.taskToBeUpdated?.status ?? "";
}

const handleSubmission = async () => {
    submitting.value = true;
    const workspaceId: Ref<string> = useCookie("workspaceId");

    const payload: Task = {
        id: props.taskToBeUpdated?.id ?? String(window.crypto.getRandomValues(new Uint32Array(1))[0]),
        user_id: user.value?.id,
        workspace_id: workspaceId.value,
        title: title.value,
        description: description.value,
        dateAdded: props.taskToBeUpdated?.dateAdded ?? new Date().toISOString().substr(0, 10),
        dueDate: dueDate.value,
        priority: priority.value,
        status: status.value,
        task_no: 1,
    }
    if (props.taskToBeUpdated) payload.task_no = props.taskToBeUpdated.task_no;
    else if (tasks.value) payload.task_no = tasks.value.length + 1;

    if (props.usage === "create") {
        addUserTask(payload);
    } else {
        updateUserTask(payload);
    }

    await fetchTasks();
    emit(props.usage === "create" ? "close" : "success");
};
</script>

<template>
    <BaseModal width="500px" @close-modal="$emit('close')">
        <template #default>
            <div class="create-task">
                <h1>{{ usage === "create" ? "Create Task" : "Edit This Task." }}</h1>
                <form @submit.prevent="handleSubmission">
                    <BaseInput label-for="title" label="Task Name" input-type="text" v-model="title" :required="true"
                        border-color="#A8ABBD" />
                    <div class="form-group">
                        <BaseSelect label="Task Priority" :lists="priorities" :selected-value="priority"
                            @selected="updatePriority" />
                        <BaseInput label-for="date" label="Due Date" input-type="date" v-model="dueDate" :required="true"
                            border-color="#A8ABBD" />
                    </div>
                    <BaseTextArea name="description" label="Task Description" placeholder="Type your content here...."
                        v-model="description" :required="true" border-color="#A8ABBD" />

                    <BaseButton :value="usage === 'create' ? 'Create Task' : 'Save Task'" background="#3754DB"
                        color="#FFFFFF" width="202px" type="submit" />
                </form>
            </div>
        </template>
    </BaseModal>
</template>

<style lang="scss" scoped>
.create-task {
    padding: 50px;

    h1 {
        font-weight: 600;
        font-size: 28px;
        line-height: 34px;
        color: #000000;
        margin-bottom: 15px;
    }

    form {
        .form-group {
            display: flex;
            gap: 15px;
            margin-bottom: 24px;
        }
    }
}
</style>
