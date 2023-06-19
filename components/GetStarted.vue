<script lang="ts" setup>
const { user, tasks } = storeToRefs(useStore());

const selected = ref("");
const showCreateTaskModal = ref(false);

const selectTodo = (value: string) => {
    selected.value = value;
};

const openProfilePictureModal = () => useEvent("uploadProfilePicture", true);
</script>

<template>
    <div class="get-started">
        <h3>Let’s get you started</h3>

        <div class="get-started__todos">
            <div v-if="!user.profile_picture" class="todo" :class="{ active: selected === 'profilePicture' }" @click="selectTodo('profilePicture')">
                <div class="todo-title">
                    <IconsGetStarted variant="profile-picture" />
                    <p>Hey {{ user.name }}, Update your Profile Picture</p>
                </div>
                <button @click="openProfilePictureModal">
                    <span>Get Started</span>
                    <IconsArrow variant="right" />
                </button>
            </div>

            <div v-if="tasks && tasks.length === 0" class="todo" :class="{ active: selected === 'firstTask' }" @click="selectTodo('firstTask')">
                <div class="todo-title">
                    <IconsGetStarted variant="first-task" />
                    <p>Create your First Task in your Workspace</p>
                </div>
                <button @click="showCreateTaskModal = true">
                    <span>Get Started</span>
                    <IconsArrow variant="right" />
                </button>
            </div>
        </div>
    </div>

    <!-- CREATE TASK MODAL -->
    <TasksCreate v-if="showCreateTaskModal" usage="create" @close="showCreateTaskModal = false" />
</template>

<style lang="scss" scoped>
.get-started {

    h3 {
        font-weight: 700;
        font-size: 20px;
        line-height: 24px;
        color: #000000;
        margin-bottom: 25px;
    }

    &__todos {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 20px;

        .todo {
            padding: 12px 14px;
            background: #FFFFFF;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;

            &-title {
                display: flex;
                align-items: center;
                gap: 14px;

                p {
                    font-weight: 400;
                    font-size: 16px;
                    line-height: 19px;
                    color: #666666;
                }
            }

            button {
                border: none;
                background: transparent;
                display: flex;
                align-items: center;
                gap: 15px;
                color: #666666;
                font-weight: 400;
                font-size: 16px;
                line-height: 19px;
                cursor: pointer;
            }
        }

        .active {
            border: 2px solid #8098FF;

            .todo-title p,
            button {
                font-weight: 600;
                color: #3754DB;
            }
        }
    }
}
</style>
