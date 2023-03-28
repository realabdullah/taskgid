<script lang="ts" setup>
import { useStore } from "@/store/index";

const store = useStore();
const navs = [
    { name: 'overview', route: '/dashboard' },
    { name: 'tasks', route: '/dashboard/tasks' },
    { name: 'settings', route: '/dashboard/settings' }
];
const showToast = ref(false);
const errorObject = ref<any>({});
const notification = ref(false);
const showProfilePictureModal = ref(false);
const workspaces = ref<any>([]);
const activeWorkspace = ref("");

const fetchUserInfo = async () => {
    try {
        const { data, error } = await useSupabaseClient()
            .from("users_info")
            .select("*")
            .eq("id", useSupabaseUser().value?.id);

        if (error) throw error;
        store.setUser(data[0]);
    } catch { }
};

const fetchUserWorkspaces = async () => {
    try {
        const { data, error } = await useSupabaseClient()
            .from("workspaces")
            .select("*")
            .eq("user_id", useSupabaseUser().value?.id);

        if (error) throw error;
        const abd = data as any;
        workspaces.value = abd;
        activeWorkspace.value = abd[0].id;
    } catch { }
};
await fetchUserInfo();
await fetchUserWorkspaces();

onMounted(() => {
    useEvent().on("showToast", (errorObj: any) => {
        errorObject.value = errorObj;
        showToast.value = true;

        setTimeout(() => {
            showToast.value = false;
        }, 2000);
    });

    useEvent().on("uploadProfilePicture", (value: boolean) => {
        showProfilePictureModal.value = value
    });
});

const setWorkspace = (id: string) => {
    activeWorkspace.value = id;
};

const openProfilePhotoModal = () => {
    showProfilePictureModal.value = true;
};

const user = computed(() => store.user) as any;
const workspaceInfo = computed(() => workspaces.value.find((workspace: any) => workspace.id === activeWorkspace.value));
const profilePictureUrl = computed(() => store.profilePhoto);
</script>

<template>
    <div class="dashboard-layout">
        <aside class="dashboard-layout__left">
            <div class="workspace-icons">
                <button v-for="workspace in workspaces" :key="workspace.id" class="workspace-avatar"
                    :class="{ active: workspace.id === activeWorkspace }" @click="setWorkspace(workspace.id)">
                    <img :src="profilePictureUrl" alt="ABD">
                </button>

                <button class="add-workspace">
                    <IconsPlus />
                </button>
            </div>
            <div class="workspace-details">
                <div class="workspace-detail">
                    <h4>{{ workspaceInfo.title }}</h4>
                    <p>{{ workspaceInfo.title }}'s Space</p>
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
            <header>
                <label for="search" class="search">
                    <input type="search" name="search" id="search" placeholder="Search your space here...">
                    <IconsSearch class="search-icon" />
                </label>

                <div class="notification-bell">
                    <IconsNotificationBell :notification="notification" />
                </div>
            </header>
            <slot />
        </main>
        <aside class="dashboard-layout__right">
            <div class="user-sidebar">
                <div class="user">
                    <img :src="profilePictureUrl" alt="ABD" @click="openProfilePhotoModal">

                    <div class="user-detail">
                        <h5>{{ user.name }}</h5>
                        <span>{{ user.email }}</span>
                    </div>

                    <BaseButton class="btn" value="My Profile" background="#3754DB" color="#FFFFFF" width="108px" />
                </div>
            </div>
        </aside>
    </div>

    <!-- UPLOAD PROFILE PICTURE -->
    <ProfilePhotoUploader v-if="showProfilePictureModal" :profile-picture="profilePictureUrl" @close="showProfilePictureModal = false" />

    <BaseToast v-if="showToast" :toast-style="errorObject.style" :type="errorObject.type" :message="errorObject.message" :description="errorObject.message" />
</template>

<style lang="scss" scoped>
.dashboard-layout {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    background: #F6F8FD;
    display: grid;
    grid-template-columns: 300px 1fr 300px;

    &__left {
        height: 100vh;
        display: flex;
        gap: 20px;
        background: #FFFFFF;

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
                border: none;
                border-radius: 10px;
                padding: 8px;
                color: #3754DB;
                cursor: pointer;
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
                }

                .active {
                    font-weight: 700;
                    color: #3754DB;
                }
            }
        }
    }

    &__center {
        padding: 25px 40px;

        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
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
    }

    &__right {

        .user-sidebar {
            width: 100%;
            max-width: 258px;
            background: #FFFFFF;
            border-radius: 24px;
            padding: 20px;
            position: fixed;
            right: 20px;
            top: 20px;
            bottom: 20px;

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
</style>
