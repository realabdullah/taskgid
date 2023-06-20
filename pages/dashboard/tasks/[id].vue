<script lang="ts" setup>
definePageMeta({
    name: "Task",
    middleware: ["auth"],
});

const route = useRoute();
const { fetchUserTask, updateUserTask, deleteUserTask } = useTasks();

const showUpdateTaskModal = ref(false);
const showDeleteModal = ref(false);

const task = ref();

const getTaskStatus = (status: string) => {
    switch (status) {
        case "Pending":
            return "pending";
        case "In Progress":
            return "in-progress";
        default:
            return "completed";
    }
};

const editTaskStatus = async (status: string) => {
    const newTask = { ...task.value };
    newTask.status = status;
    const response = await updateUserTask(newTask);
    if (response) task.value = newTask;
    else {
        useEvent("showToast", {
            toastStyle: "solid",
            type: "error",
            message: "Error!",
            description: "We couldn't update the task. Please try again.",
        });
    }
};

const deleteTask = async () => {
    const status = await deleteUserTask(task.value.id);
    if (status) navigateTo("/dashboard/tasks");
    else {
        showDeleteModal.value = false;
        useEvent("showToast", {
            toastStyle: "solid",
            type: "error",
            message: "Error!",
            description: "We couldn't delete the task. Please try again.",
        });
    }
};

const taskUpdated = async () => {
    task.value = await fetchUserTask(taskId.value);
    showUpdateTaskModal.value = false;
};

const taskId = computed(() => route.params.id) as Ref<string>;
task.value = await fetchUserTask(taskId.value);
</script>

<template>
    <NuxtLayout name="dashboard">
        <div class="task-page">
            <div class="breadcumb">
                <nuxt-link to="/dashboard/tasks">Tasks</nuxt-link>
                <IconsArrow variant="chevron-right" />
                <span>{{ task.title }}</span>
            </div>

            <nuxt-link to="/dashboard/tasks" class="back">
                <IconsArrow variant="left" />
            </nuxt-link>

            <div class="task-card">
                <div class="task-card__detail">
                    <p class="title">{{ task.title }}</p>
                    <span class="status" :class="getTaskStatus(task.status)">{{ task.status }}</span>
                    <p class="desc">{{ task.description }}</p>
                    <div class="ctas">
                        <BaseButton v-if="task.status === 'Pending'" class="btn" value="Work on it Now" background="#3754DB"
                            color="#FFFFFF" width="180px" @click="editTaskStatus('In Progress')" />
                        <BaseButton v-else-if="task.status === 'In Progress'" class="btn" value="Mark As Done"
                            background="#00C271" color="#FFFFFF" width="180px" @click="editTaskStatus('Completed')" />
                        <div v-else-if="task.status === 'Completed'" class="task-completed">
                            <IconsCompleted />
                            <span>This task has been completed</span>
                        </div>
                        <button class="delete" @click="showDeleteModal = true">
                            <IconsDelete />
                        </button>
                        <button class="edit" @click="showUpdateTaskModal = true">
                            <IconsEdit />
                        </button>
                    </div>
                </div>

                <div class="task-card__dates">
                    <div class="task-date">
                        <div class="task-date__created">
                            <span class="title">Date Created</span>
                            <span class="date">{{ task.dateAdded }}</span>
                        </div>
                        <IconsEllipse variant="outline" />
                    </div>
                    <hr>
                    <div class="task-date">
                        <div class="task-date__created">
                            <span class="title">Due Date</span>
                            <span class="date">{{ task.dueDate }}</span>
                        </div>
                        <IconsEllipse variant="solid" />
                    </div>
                </div>
            </div>
        </div>

        <!-- UPDATE TASK MODAL -->
        <TasksCreate v-if="showUpdateTaskModal" usage="update" :task-to-be-updated="task" @success="taskUpdated"
            @close="showUpdateTaskModal = false" />

        <!-- DELETE TASK -->
        <BaseModal v-if="showDeleteModal" width="500px" @close-modal="showDeleteModal = false">
            <template #default>
                <div class="delete-task">
                    <h1>Delete Task</h1>
                    <p>Are you sure you want to delete the task
                        <b>‘{{ task.title }}’</b> ? This task is {{ task.status.toLowerCase() }}.
                    </p>
                    <div class="delete-task__ctas">
                        <BaseButton value="No" background="#3754DB" color="#FFFFFF" width="120px"
                            @click="showDeleteModal = false" />
                        <BaseButton value="Yes" background="#FFF0F0" color="#B80020" width="120px" @click="deleteTask" />
                    </div>
                </div>
            </template>
        </BaseModal>
    </NuxtLayout>
</template>

<style scoped lang="scss">
.task-page {
    .breadcumb {
        display: flex;
        align-items: flex-end;
        gap: 5px;
        margin-bottom: 15px;

        a {
            text-decoration: none;
            font-weight: 600;
            font-size: 32px;
            color: #101C56;
        }

        span {
            font-weight: 500;
            font-size: 16px;
            line-height: 19px;
            color: #101C56;
        }
    }

    .back {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        background: #EEF0FC;
        color: #3754DB;
        border-radius: 12px;
        margin-bottom: 20px;
    }

    .task-card {
        background: #FFFFFF;
        border-radius: 16px;
        padding: 32px 40px;
        display: flex;
        align-items: stretch;
        justify-content: space-between;

        @media screen and (max-width: 767px) {
            padding: 32px 20px;
        }

        @media screen and (max-width: 1400px) {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
        }

        @media screen and (max-width: 700px) {
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }

        &__detail {
            display: flex;
            flex-direction: column;
            align-items: flex-start;

            .title {
                max-width: 380px;
                font-weight: 500;
                font-size: 24px;
                line-height: 29px;
                color: #000000;
                margin-bottom: 12px;
            }

            .status {
                display: block;
                font-weight: 500;
                font-size: 12px;
                line-height: 14px;
                color: #00C271;
                background: #F0FFF9;
                border-radius: 12px;
                padding: 5px 10px;
            }

            .pending {
                background: #FFFDF5 !important;
                color: #DF9A00 !important;
            }

            .in-progress {
                background: #F2F4FD !important;
                color: #3754DB !important;
            }

            .desc {
                max-width: 520px;
                margin-top: 20px;
                font-weight: 400;
                font-size: 16px;
                line-height: 24px;
                color: #808080;
            }

            .ctas {
                margin-top: 40px;
                display: flex;
                align-items: center;
                gap: 20px;

                @media screen and (max-width: 767px) {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }

                .task-completed {
                    display: flex;
                    align-items: center;
                    gap: 12px;

                    span {
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 19px;
                        color: #00A35F;
                    }
                }

                .btn {
                    margin-top: 0;
                }

                .delete,
                .edit {
                    border: 0;
                    background: transparent;
                    padding: 12px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .delete {
                    background: #FFF0F0;
                }

                .edit {
                    background: #F6F8FD;
                }
            }
        }

        &__dates {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: space-between;

            @media screen and (max-width: 1400px) {
                align-items: center;
                flex-direction: unset;
                gap: 10px;
            }

            .task-date {
                display: flex;
                align-items: center;
                gap: 12px;

                &__created {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 2px;
                    white-space: nowrap;

                    .title {
                        font-weight: 400;
                        font-size: 12px;
                        line-height: 14px;
                        color: #999999;
                    }

                    .date {
                        font-weight: 700;
                        font-size: 14px;
                        line-height: 17px;
                        color: #16171D;
                    }
                }
            }

            hr {
                background: #D5D5D5;
                width: 0.6px;
                height: 100%;
                margin-right: 13px;

                @media screen and (max-width: 1400px) {
                    width: 50px;
                    height: 0.6px;
                    margin-right: 0;
                }
            }
        }
    }
}

.delete-task {
    padding: 50px;

    h1 {
        font-weight: 600;
        font-size: 28px;
        line-height: 34px;
        color: #000000;
    }

    p {
        margin-top: 15px;
        font-weight: 400;
        font-size: 18px;
        line-height: 24px;
        color: #666666;
    }

    &__ctas {
        display: flex;
        align-items: center;
        gap: 16px;
    }
}
</style>
