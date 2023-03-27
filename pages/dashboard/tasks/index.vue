<script lang="ts" setup>
definePageMeta({
	title: "Tasks - Dashboard",
	name: "Tasks",
	middleware: ["auth"],
});

const priorities = ["Less Important", "Important", "High Priority"];
const showCreateTaskModal = ref(false);
const taskName = ref("");
const taskPriority = ref("");
const taskDescription = ref("");
const dueDate = ref(new Date().toISOString().substr(0, 10) as string);

const updateTaskPriority = (value: string) => {
    taskPriority.value = value;
};
</script>

<template>
    <NuxtLayout name="dashboard">
        <div class="task-page">
            <h1 class="task-page__header">Tasks </h1>
            <p class="task-page__description">Your tasks in your space.</p>

            <div class="task-page__empty">
                <IconsTask variant="large" />

                <h2>No Tasks Yet</h2>
                <p>You have no task created in your workspace yet.</p>
                <p>Get productive. Create a Task Now.</p>

                <BaseButton class="btn" value="Create a Task" background="#3754DB" color="#FFFFFF" width="213px" @click="showCreateTaskModal = true" />
            </div>
        </div>

        <!-- CREATE TASK MODAL -->
        <BaseModal v-if="showCreateTaskModal" width="500px" @close-modal="showCreateTaskModal = false">
            <template #default>
                <div class="create-task">
                    <h1>Create Task</h1>
                    <form>
                        <BaseInput label-for="taskName" label="Task Name" input-type="text" :model-value="taskName" :required="true" border-color="#A8ABBD" />
                        <div class="form-group">
                            <BaseSelect label="Task Priority" :lists="priorities" @selected="updateTaskPriority" />
                            <BaseInput label-for="date" label="Due Date" input-type="date" :model-value="dueDate" :required="true" border-color="#A8ABBD" />
                        </div>
                        <BaseTextArea name="taskDescription" label="Task Description" placeholder="Type your content here...." :model-value="taskDescription" :required="true" border-color="#A8ABBD" />

                        <BaseButton value="Create Task" background="#3754DB" color="#FFFFFF" width="202px" type="submit" />
                    </form>
                </div>
            </template>
        </BaseModal>
    </NuxtLayout>
</template>

<style lang="scss" scoped>
.task-page {

    &__header {
        font-weight: 600;
        font-size: 32px;
        line-height: 38px;
        color: #101C56;
        margin-bottom: 12px;
    }

    &__description {
        font-weight: 400;
        font-size: 20px;
        line-height: 24px;
        color: #636363;
    }

    &__empty {
        margin-top: 100px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        h2 {
            margin: 50px 0 12px;
            font-weight: 600;
            font-size: 28px;
            line-height: 34px;
            color: #000000;
        }

        p {
            font-weight: 400;
            font-size: 16px;
            line-height: 19px;
            color: #6D6C6C;
        }

        .btn {
            margin-top: 24px;
            align-self: unset;
        }
    }
}

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
