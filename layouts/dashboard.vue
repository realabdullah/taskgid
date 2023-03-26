<script lang="ts" setup>
const showToast = ref(false);
const errorMessage = ref("");
const toastStyle = ref("");
const type = ref("");
const message = ref("");
const notification = ref(false);
const showProfilePictureModal = ref(false);
const photoUploaded = ref(false);

const navs = [
    { name: 'overview', route: '/dashboard' },
    { name: 'tasks', route: '/dashboard/tasks' },
    { name: 'settings', route: '/dashboard/settings' }
]

onMounted(() => {
    useEvent().on("showToast", (errorObj: any) => {
        errorMessage.value = errorObj.message;
        toastStyle.value = errorObj.style;
        type.value = errorObj.type;
        message.value = errorObj.message;
        showToast.value = true;

        setTimeout(() => {
            showToast.value = false;
        }, 2000);
    });

    useEvent().on("uploadProfilePicture", (value: boolean) => {
        showProfilePictureModal.value = value
    });
});
</script>

<template>
    <div class="dashboard-layout">
        <aside class="dashboard-layout__left">
            <div class="workspace-icons">
                <button class="workspace-avatar">
                    <img src="https://i.ibb.co/fMm1MMv/download.jpg" alt="ABD">
                </button>

                <button class="add-workspace">
                    <IconsPlus />
                </button>
            </div>
            <div class="workspace-details">
                <div class="workspace-detail">
                    <h4>ABD</h4>
                    <p>Realabd’s Space</p>
                </div>

                <div class="workspace-nav">
                    <NuxtLink v-for="(nav, index) in navs" :key="index" :to="nav.route" class="workspace-nav__item" :class="{ active: $route.path === nav.route }">
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
                    <img src="https://i.ibb.co/fMm1MMv/download.jpg" alt="ABD">

                    <div class="user-detail">
                        <h5>Oni Faith Ayoola</h5>
                        <span>onifaith@gmail.com</span>
                    </div>

                    <BaseButton class="btn" value="My Profile" background="#3754DB" color="#FFFFFF" width="108px" />
                </div>
            </div>
        </aside>
    </div>

    <!-- UPLOAD PROFILE PICTURE -->
    <BaseModal v-if="showProfilePictureModal" width="460px" @close-modal="showProfilePictureModal = false">
        <template #default>
            <div class="profile-uploader">
                <h3>Upoad your Profile Picture</h3>
                <div class="profile-container">
                    <img src="https://i.ibb.co/kBGCJnQ/Group-67.png" alt="photo">
                    <span v-if="!photoUploaded">Tap Icon to Select Picture</span>
                    <IconsCheck v-if="photoUploaded" class="uploaded" variant="large" />
                </div>
                <button>Upoad Picture</button>
            </div>
        </template>
    </BaseModal>

    <BaseToast v-if="showToast" :toast-style="toastStyle" :type="type" :message="message" :description="errorMessage" />
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
                border: 1.4px solid #FBBE37;
                border-radius: 12px;
                padding: 5px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;

                img {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                }
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
                    border-radius: 16px;
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

.profile-uploader {
    padding: 50px;

    h3 {
        font-weight: 700;
        font-size: 24px;
        line-height: 32px;
    }

    .profile-container {
        margin-top: 50px;
        position: relative;
        width: 100%;
        height: 340px;
        border-radius: 24px;
        cursor: pointer;

        .uploaded {
            position: absolute;
            bottom: -40px;
            left: 50%;
            transform: translate(-50%, 0);
        }

        span {
            position: absolute;
            left: 50%;
            transform: translate(-50%, 0);
            bottom: 22px;
            display: block;
            max-width: 189px;
            background: #ffffff1a;
            border-radius: 12px;
            padding: 12px;
            font-weight: 400;
            font-size: 16px;
            line-height: 19px;
            color: #FFFFFF;
            white-space: nowrap;
        }
    }

    button {
        margin-top: 40px;
        width: 100%;
        background: #3754DB;
        border: none;
        border-radius: 12px;
        padding: 20px;
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        color: #FFFFFF;
    }
}
</style>
