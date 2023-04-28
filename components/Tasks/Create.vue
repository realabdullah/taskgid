<script lang="ts" setup>
const { tasks } = storeToRefs(useStore());
const { fetchTasks } = useStore();

const priorities = ["Less Important", "Important", "High Priority"];
const title = ref("");
const description = ref("");
const dueDate = ref(new Date().toISOString().substr(0, 10) as string);
const priority = ref("");
const submitting = ref(false);

const updatePriority = (value: string) => {
    priority.value = value;
};
const emit = defineEmits(["close"]);
const client = useSupabaseClient();
const user = useSupabaseUser();

const createTask = async () => {
    submitting.value = true;
    const payload = {
        user_id: user.value?.id,
        title: title.value,
        description: description.value,
        dateAdded: new Date().toISOString().substr(0, 10),
        dueDate: dueDate.value,
        priority: priority.value,
        status: "Pending",
        task_no: tasks.value.length + 1,
    };

    const { error } = await client.from('tasks').insert(payload as any);

    if (error) {
        submitting.value = false;
        return;
    }

    await fetchTasks();
    emit('close');
};
</script>

<template>
    <BaseModal width="500px" @close-modal="$emit('close')">
        <template #default>
            <div class="create-task">
                <h1>Create Task</h1>
                <form @submit.prevent="createTask">
                    <BaseInput label-for="title" label="Task Name" input-type="text" v-model="title" :required="true"
                        border-color="#A8ABBD" />
                    <div class="form-group">
                        <BaseSelect label="Task Priority" :lists="priorities" @selected="updatePriority" />
                        <BaseInput label-for="date" label="Due Date" input-type="date" :model-value="dueDate"
                            :required="true" border-color="#A8ABBD" />
                    </div>
                    <BaseTextArea name="description" label="Task Description" placeholder="Type your content here...."
                        v-model="description" :required="true" border-color="#A8ABBD" />

                    <BaseButton value="Create Task" background="#3754DB" color="#FFFFFF" width="202px" type="submit" />
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
