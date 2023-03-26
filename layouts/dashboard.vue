<script lang="ts" setup>
const showToast = ref(false);
const errorMessage = ref("");
const toastStyle = ref("");
const type = ref("");
const message = ref("");

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
    })
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
                    <h4>Me & I</h4>
                    <p>Emmanuel’s Space</p>
                </div>

                <div class="workspace-nav">
                    <a href="#" class="workspace-nav__item active">
                        <IconsOverview />
                        <span>Overview</span>
                    </a>
                    <a href="#" class="workspace-nav__item">
                        <IconsTasks />
                        <span>Tasks</span>
                    </a>
                    <a href="#" class="workspace-nav__item">
                        <IconsSettings />
                        <span>Settings</span>
                    </a>
                </div>
            </div>
        </aside>
        <main class="dashboard-layout__center">
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

                    <FormInputButton class="btn" value="My Profile" background="#3754DB" color="#FFFFFF" width="108px" />
                </div>
            </div>
        </aside>
    </div>


    <Toast v-if="showToast" :toast-style="toastStyle" :type="type" :message="message" :description="errorMessage" />
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
</style>
