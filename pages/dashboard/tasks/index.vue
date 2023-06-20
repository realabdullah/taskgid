<script lang="ts" setup>
definePageMeta({
    title: "Tasks - Dashboard",
    name: "Tasks",
    middleware: ["auth"],
});

const { tasks } = storeToRefs(useStore());
const { fetchTasks } = useStore();

const showCreateTaskModal = ref(false);
const tasksTab = ["All Tasks", "Pending", "In Progress", "Completed"];
const activeTab = ref("All Tasks");
const indicatorWidth = ref(0);
const indicatorLeft = ref(0);

const setActiveTab = (tab: string) => {
    activeTab.value = tab;

    const index = tasksTab.indexOf(tab);
    const button = document.querySelectorAll(".tasks-bar button")[index] as HTMLElement;

    indicatorWidth.value = button.offsetWidth;
    indicatorLeft.value = button.offsetLeft;
};

const taskCount = computed(() => (value: string) =>
  tasks.value ? tasks.value.filter(task => value === "All Tasks" || task.status === value).length : 0
);


const filteredTasks = computed(() =>
  tasks.value ? tasks.value.filter(task => activeTab.value === "All Tasks" || task.status === activeTab.value) : []
);

onMounted(() => {
    if (tasks.value && tasks.value.length > 0) setActiveTab("All Tasks");
});

await fetchTasks();
</script>

<template>
    <NuxtLayout name="dashboard">
        <div class="task-page">
            <div class="task-page__header">
                <div class="texts">
                    <h1>Tasks</h1>
                    <p>Your tasks in your space.</p>
                </div>
                <BaseButton v-if="tasks && tasks.length > 0" class="btn" value="Create Task" background="#3754DB" color="#FFFFFF" width="169px"
                    @click="showCreateTaskModal = true" />
            </div>

            <div v-if="tasks && tasks.length > 0" class="task-page__list">
                <div class="tasks-bar">
                    <button v-for="(tab, index) in tasksTab" :key="index" :class="{ active: activeTab === tab }"
                        @click="setActiveTab(tab)">
                        <span class="tab">{{ tab }}</span>
                        <span class="count">{{ taskCount(tab) }}</span>
                    </button>

                    <span class="indicator"
                        :style="{ width: `${indicatorWidth}px`, transform: `translateX(${indicatorLeft}px)` }"></span>
                </div>

                <div v-if="filteredTasks.length > 0" class="tasks">
                    <TasksCard v-for="task in filteredTasks" :key="task.id" :task="task" />
                </div>
                <TasksEmpty v-else :description="`You have no task ${activeTab.toLowerCase()} yet.`" :extra-text="`Get productive. Have a Task ${activeTab}.`" />
            </div>

            <TasksEmpty v-else button-text="Create a Task" description="You have no task created in your workspace yet." extra-text="Get productive. Create a Task Now." @create-task="showCreateTaskModal = true" />
        </div>

        <!-- CREATE TASK MODAL -->
        <TasksCreate v-if="showCreateTaskModal" usage="create" @close="showCreateTaskModal = false" />
    </NuxtLayout>
</template>

<style lang="scss" scoped>
.task-page {

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 13px;

        @media screen and (max-width: 700px) {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }

        .texts {
            h1 {
                font-weight: 600;
                font-size: 32px;
                line-height: 38px;
                color: #101C56;
                margin-bottom: 12px;
            }

            p {
                font-weight: 400;
                font-size: 20px;
                line-height: 24px;
                color: #636363;
            }
        }
    }

    &__list {
        margin-top: 42px;

        .tasks-bar {
            // width: fit-content;
            width: 100%;
            display: flex;
            align-items: center;
            gap: 28px;
            padding-bottom: 14px;
            border-bottom: 0.34px solid #A9A9A9;
            position: relative;
            overflow: hidden;
            overflow-x: auto;
            scrollbar-width: none;

            &::-webkit-scrollbar {
                display: none;
            }

            button {
                border: 0;
                background: transparent;
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;

                .tab {
                    font-weight: 400;
                    font-size: 16px;
                    line-height: 19px;
                    color: #808080;
                    white-space: nowrap;
                }

                .count {
                    display: block;
                    font-weight: 500;
                    font-size: 12px;
                    line-height: 14px;
                    color: #16171D;
                    padding: 5px 12px;
                    background: #F0F0F0;
                    border-radius: 12px;
                }
            }

            .active {

                .tab {
                    font-weight: 600;
                    color: #3754DB;
                }

                .count {
                    background: #F2F4FD;
                    color: #3754DB;
                }
            }

            .indicator {
                position: absolute;
                bottom: -0.34px;
                left: 0;
                height: 2px;
                background: #3754DB;
                transition: all 0.3s ease-in-out;
            }
        }

        .tasks {
            margin-top: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, 248px);
            gap: 20px;
        }
    }
}
</style>
