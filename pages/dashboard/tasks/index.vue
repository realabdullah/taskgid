<script lang="ts" setup>
definePageMeta({
	title: "Tasks - Dashboard",
	name: "Tasks",
	middleware: ["auth"],
});

const showCreateTaskModal = ref(false);
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
        <CreateTask v-if="showCreateTaskModal" @close="showCreateTaskModal = false" />
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
</style>
