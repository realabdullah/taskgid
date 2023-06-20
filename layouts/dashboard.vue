<script lang="ts" setup>
const { fetchUserInfo, fetchTasks } = useStore();
const { user, profilePhoto } = storeToRefs(useStore());
const { getUserWorkspaces } = useUser();

// DATA PROPERTIES
const navs = [
    { name: 'overview', route: '/dashboard' },
    { name: 'tasks', route: '/dashboard/tasks' },
    { name: 'settings', route: '/dashboard/settings' }
];
const showToast = ref(false);
const errorObject = ref({} as Toast);
const notification = ref(false);
const showProfilePictureModal = ref(false);
const workspaces = ref<Workspace[]>([]);
const activeWorkspace = ref("");

// COMPUTED VALUES
const workspaceInfo = computed(() => workspaces.value.find((workspace: Workspace) => workspace.id === activeWorkspace.value) ?? {} as Workspace);

// METHODS
const setWorkspace = (id: string) => {
    activeWorkspace.value = id;
    workspaceId.value = id;
    fetchTasks();
};

const openProfilePhotoModal = () => {
    showProfilePictureModal.value = true;
};

useListen("showToast", (errorObj) => {
    errorObject.value = errorObj as Toast;
    showToast.value = true;

    setTimeout(() => {
        showToast.value = false;
    }, 4000);
});

useListen("uploadProfilePicture", (value) => {
    showProfilePictureModal.value = value as boolean;
});

// FETCH DATA
await fetchUserInfo();
const response = await getUserWorkspaces(user.value.id);
workspaces.value = response ? response : [];
activeWorkspace.value = workspaces.value[0]?.id ?? "";
const workspaceId = useCookie("workspaceId");
workspaceId.value = activeWorkspace.value;
</script>

<template>
    <div class="dashboard-layout">
        <aside class="dashboard-layout__left">
            <div class="workspace-icons">
                <button v-for="workspace in workspaces" :key="workspace.id" class="workspace-avatar"
                    :class="{ active: workspace.id === activeWorkspace }" @click="setWorkspace(workspace.id)">
                    <img :src="workspace.dispay_picture" alt="workspacepicture">
                </button>

                <nuxt-link to="/create-workspace" class="add-workspace">
                    <IconsPlus />
                </nuxt-link>
            </div>
            <div class="workspace-details">
                <div class="workspace-detail">
                    <h4>{{ workspaceInfo.title }}</h4>
                    <p>{{ workspaceInfo.title || user.name }}'s Space</p>
                </div>

                <div class="workspace-nav">
                    <NuxtLink v-for="(nav, index) in navs" :key="index" :to="nav.route" class="workspace-nav__item"
                        :class="{ active: $route.path === nav.route }">
                        <IconsSideNav :variant="nav.name" />
                        <span>{{ nav.name }}</span>
                    </NuxtLink>
                </div>
            </div>
        </aside>
        <main class="dashboard-layout__center">
            <div class="container">
                <header>
                    <label for="search" class="search">
                        <input type="search" name="search" id="search" placeholder="Search your space here...">
                        <IconsSearch class="search-icon" />
                    </label>

                    <div class="notification-bell">
                        <IconsNotificationBell :notification="notification" />
                    </div>
                </header>
                <NuxtLoadingIndicator color="#3754DB" />
                <slot />
                <BaseToast v-if="showToast" class="toast" :toast-style="errorObject.toastStyle" :type="errorObject.type"
                    :message="errorObject.message" :description="errorObject.description" />
            </div>
        </main>
        <aside class="dashboard-layout__right">
            <div class="user-sidebar">
                <div class="user">
                    <img :src="profilePhoto" alt="ABD" @click="openProfilePhotoModal">

                    <div class="user-detail">
                        <h5>{{ user.name }}</h5>
                        <span>{{ user.email }}</span>
                    </div>

                    <BaseButton class="btn" value="My Profile" background="#3754DB" color="#FFFFFF" width="108px" />
                </div>
            </div>
        </aside>
    </div>

    <div class="mobile">Please view on a much larger screen. 🫠</div>

    <!-- UPLOAD PROFILE PICTURE -->
    <ProfilePhotoUploader v-if="showProfilePictureModal" :profile-picture="profilePhoto"
        @close="showProfilePictureModal = false" />
</template>

<style lang="scss" scoped>
.dashboard-layout {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    background: #F6F8FD;
    display: grid;
    grid-template-columns: minmax(0, 300px) minmax(0, 1fr) minmax(0, 300px);

    @media screen and (max-width: 550px) {
        display: none;
    }

    @media screen and (max-width: 1044px) {
        grid-template-columns: minmax(0, 300px) minmax(0, 1fr);
    }

    @media screen and (max-width: 700px) {
        grid-template-columns: minmax(0, 150px) minmax(0, 1fr);
    }

    &__left {
        height: 100vh;
        display: flex;
        gap: 20px;
        background: #FFFFFF;

        @media screen and (max-width: 700px) {
            gap: 0;
        }

        .workspace-icons {
            width: 100%;
            max-width: 70px;
            background: #3754DB;
            padding: 16px;
            padding-top: 100px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;

            .workspace-avatar {
                width: 48px;
                height: 48px;
                background: #3754DB;
                border: 0;
                border-radius: 12px;
                padding: 5px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;

                img {
                    width: 40px;
                    height: 40px;
                    object-fit: cover;
                    border-radius: 10px;
                }
            }

            .active {
                border: 1.4px solid #FBBE37;
            }

            .add-workspace {
                width: 38px;
                height: 38px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                padding: 8px;
                color: #3754DB;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }

        .workspace-details {
            width: 100%;
            max-width: 230px;
            padding: 20px;
            padding-top: 100px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 80px;

            .workspace-detail {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;

                @media screen and (max-width: 700px) {
                    display: none;
                }

                h4 {
                    font-weight: 700;
                    font-size: 20px;
                    line-height: 24px;
                    color: #101C56;
                }

                p {
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 17px;
                    color: #666666;
                }
            }

            .workspace-nav {
                display: flex;
                align-items: flex-start;
                flex-direction: column;
                gap: 30px;

                &__item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                    font-weight: 400;
                    font-size: 16px;
                    line-height: 19px;
                    color: #666666;
                    text-transform: capitalize;

                    span {
                        @media screen and (max-width: 700px) {
                            display: none;
                        }
                    }
                }

                .active {
                    font-weight: 700;
                    color: #3754DB;
                }
            }
        }
    }

    &__center {
        position: relative;
        width: 100%;
        max-width: 1500px;
        margin: 0 auto;

        .container {
            padding: 25px 40px;

            @media screen and (max-width: 700px) {
                padding: 25px 20px;
            }

            header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 13px;
                margin-bottom: 50px;

                .search {
                    position: relative;
                    width: 100%;
                    max-width: 350px;

                    input {
                        width: 100%;
                        height: 50px;
                        border: 0.7px solid #A8ABBD;
                        border-radius: 12px;
                        background: transparent;
                        padding: 16px;

                        &::placeholder {
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                    }

                    &-icon {
                        position: absolute;
                        top: 50%;
                        transform: translate(0, -50%);
                        right: 15px;
                        cursor: pointer;
                    }
                }
            }

            .toast {
                position: absolute;
                top: 80px;
                right: 40px;
                z-index: 1000;
            }
        }
    }

    &__right {
        // height: 100vh;
        width: 100%;
        max-width: 258px;
        background: #FFFFFF;
        border-radius: 24px;
        padding: 20px;
        margin: 20px;
        // position: fixed;
        // right: 20px;
        // top: 20px;
        // bottom: 20px;

        @media screen and (max-width: 1044px) {
            display: none;
        }

        .user-sidebar {


            .user {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap: 24px;

                img {
                    width: 100%;
                    max-width: 90px;
                    height: 100%;
                    max-height: 90px;
                    object-fit: cover;
                    border-radius: 16px;
                    box-shadow: rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;
                }

                .user-detail {
                    text-align: center;

                    h5 {
                        font-weight: 700;
                        font-size: 20px;
                        line-height: 24px;
                        color: #101C56;
                        margin-bottom: 5px;
                    }

                    span {
                        font-weight: 400;
                        font-size: 14px;
                        line-height: 17px;
                        color: #666666;
                    }
                }

                .btn {
                    align-self: center;
                }
            }
        }
    }
}

.mobile {
    display: none;

    @media screen and (max-width: 550px) {
        display: block;
        width: 100%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        padding: 16px;
    }
}
</style>
