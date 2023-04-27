<script lang="ts" setup>
defineProps<{
    task: Task;
}>();

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
</script>

<template>
    <div class="tasks-card">
        <div class="status">
            <span>T-25</span>
            <span :class="getTaskStatus(task.status)">{{ task.status }}</span>
        </div>
        <p>{{ task.title }}</p>
        <button>
            <span>View Task</span>
            <IconsArrow variant="right" />
        </button>
    </div>
</template>

<style scoped lang="scss">
.tasks-card {
    background: #FFFFFF;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .status {
        display: flex;
        align-items: center;
        justify-content: space-between;

        span {
            &:first-child {
                font-weight: 600;
                font-size: 14px;
                line-height: 17px;
                color: #B9B9B9;
            }

            &:last-child {
                display: block;
                font-weight: 500;
                font-size: 12px;
                line-height: 14px;
                color: #00C271;
                background: #F0FFF9;
                border-radius: 12px;
                padding: 5px 10px;
            }
        }

        .pending {
            background: #FFFDF5 !important;
            color: #DF9A00 !important;
        }

        .in-progress {
            background: #F2F4FD !important;
            color: #3754DB !important;
        }
    }

    p {
        margin-top: 15px;
        margin-bottom: 25px;
        max-width: 200px;
        font-weight: 500;
        font-size: 16px;
        line-height: 22px;
        color: #16171D;
    }

    button {
        border: 0;
        background: transparent;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        line-height: 17px;
        color: #3754DB;
        padding-left: 0;
    }
}
</style>
