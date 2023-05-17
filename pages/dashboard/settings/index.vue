<script lang="ts" setup>
definePageMeta({
    title: "Settings - Dashboard",
    name: "Settings",
    middleware: ["auth"],
});

const { user } = storeToRefs(useStore());
const client = useSupabaseClient();

const name = ref(user.value.name);
const email = ref(user.value.email);
const password = ref("");
const showModal = ref(false);
const modalState = ref("edit-profile");

const openOrCloseModal = (status: boolean, state: string) => {
    modalState.value = state;
    showModal.value = status;
};

const handleEditProfile = async () => {
    const payload = {
        name: name.value,
        email: email.value,
    };

    const { error: updateError } = await client.auth.updateUser({
        email: email.value,
        password: password.value,
    });

    const { error } = await client.from('users_info').update(payload).eq('id', user.value.id);

    if (updateError || error) {
        return;
    }

    user.value.name = name.value;
    user.value.email = email.value;
    openOrCloseModal(false, "");
};

const logOut = async () => {
    const { error } = await client.auth.signOut();
    if (error) {
        return;
    }
    navigateTo("/login");
};
</script>

<template>
    <NuxtLayout name="dashboard">
        <div class="settings-page">
            <h3>Settings</h3>
            <div class="log-out">
                <BaseButton value="Log Out" background="#B80020" color="#FFFFFF" width="125px" @click="openOrCloseModal(true, 'log-out')" />
            </div>

            <div class="settings-page__card">
                <h5>Account Settings</h5>
                <div class="card-content">
                    <div class="card-content__box">
                        <IconsUser class="icon" />
                        <div class="details">
                            <span>Fullname</span>
                            <span>{{ user.name }}</span>
                        </div>
                    </div>

                    <div class="card-content__box">
                        <IconsEmail class="icon" />
                        <div class="details">
                            <span>Email Address</span>
                            <span>{{ user.email }}</span>
                        </div>
                    </div>

                    <div class="card-content__box">
                        <div class="details">
                            <span>Password</span>
                            <span>**********</span>
                        </div>
                    </div>

                    <BaseButton style="align-self: flex-end;" value="Edit" background="#3754DB" color="#FFFFFF" width="125px"  @click="openOrCloseModal(true, 'edit-profile')" />
                </div>
            </div>
        </div>

        <BaseModal v-if="showModal" width="500px" @close-modal="openOrCloseModal(false, '')">
            <template #default>
                <div class="edit-profile">
                    <h1>{{ modalState === "edit-profile" ? "Edit Profile" : "You are about to log out" }}</h1>
                    <form v-if="modalState === 'edit-profile'" @submit.prevent="handleEditProfile">
                        <BaseInput label-for="name" label="Fullname" input-type="text" v-model="name" :required="true" border-color="#2746D8" />
                        <BaseInput label-for="email" label="Email Address" input-type="email" v-model="email" :required="true" border-color="#2746D8" />
                        <BaseInput label-for="password" label="Password" input-type="password" v-model="password" :required="true" border-color="#2746D8" />

                        <BaseButton value="Save" background="#3754DB" color="#FFFFFF" width="140px" type="submit" />
                    </form>
                    <div v-else class="">
                        <p>You can always log on to your task manager and continue from where you left off..</p>
                        <div class="buttons">
                            <BaseButton value="Cancel" background="#3754DB" color="#FFFFFF" width="140px" @click="openOrCloseModal(false, '')" />
                            <BaseButton value="Log Out" background="#FFF0F0" color="#B80020" width="140px" @click="logOut" />
                        </div>
                    </div>
                </div>
            </template>
        </BaseModal>
    </NuxtLayout>
</template>

<style lang="scss" scoped>
.settings-page {

    h3 {
        font-weight: 600;
        font-size: 32px;
        line-height: 38px;
        color: #101C56;
    }

    .log-out {
        display: flex;
        justify-content: flex-end;
    }

    &__card {
        margin-top: 24px;

        h5 {
            font-weight: 400;
            font-size: 20px;
            line-height: 24px;
            color: #101C56;
            margin-bottom: 20px;
        }

        .card-content {
            background: #FFFFFF;
            border-radius: 16px;
            padding: 32px 24px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;

            &__box {
                width: 100%;
                box-sizing: border-box;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 25px;
                border: 0.2px solid #B8B8B8;
                border-radius: 16px;

                .details {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;

                    span {
                        &:first-child {
                            font-weight: 400;
                            font-size: 16px;
                            line-height: 19px;
                            color: #545454;
                        }

                        &:last-child {
                            font-weight: 600;
                            font-size: 20px;
                            line-height: 24px;
                            color: #000000;
                        }
                    }
                }
            }
        }
    }
}

.edit-profile {
    padding: 40px;

    h1 {
        font-weight: 600;
        font-size: 28px;
        line-height: 34px;
        color: #101C56;
        margin-bottom: 22px;
    }

    p {
        font-weight: 400;
        font-size: 18px;
        line-height: 24px;
        color: #8C8C8C;
    }

    .buttons {
        display: flex;
        gap: 20px;
    }
}
</style>
