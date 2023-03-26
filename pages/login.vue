<script lang="ts" setup>

definePageMeta({
    title: 'Login',
    name: 'login',
    middleware: ['guest']
});

const email = ref('');
const password = ref('');
const submitting = ref(false);
const loginError = ref("");
const client = useSupabaseAuthClient();

watchEffect(() => {
    if (email.value !== '' && password.value !== '') {
        loginError.value = "";
    }
});

const submitForm = async () => {
    submitting.value = true;
    if (email.value === '' || password.value === '') return;

    const { error } = await client.auth.signInWithPassword({
        email: email.value,
        password: password.value
    });

    if (error) {
        loginError.value = error.message;
        submitting.value = false;
        return;
    }

    const cookie = useCookie<boolean>("userAuthenticated");
    cookie.value = true;
    navigateTo('/dashboard');
};
</script>

<template>
    <NuxtLayout name="auth">
        <Toast v-if="!!loginError" toast-style="solid" type="error" message="Login Error!" :description="loginError" />
        <template #cta>Create Account</template>
        <div class="login__form">
            <h5 class="login__form-header">Welcome Back.</h5>

            <form @submit.prevent="submitForm">
                <FormInputText v-model="email" input-type="email" label-for="email" label="Email Address" placeholder="anon@anon.anon"
                    hint="Example. mano@gmail.com" />

                <FormInputText v-model="password" input-type="password" label-for="password" label="Enter Your Password"
                    placeholder="Enter password" hint="Upto 8 characters with an Uppercase, symbol and number" />

                <FormInputButton width="204px" :value="submitting ? 'loading' : 'Log In'" background="#3754DB" color="#FFFFFF" />
            </form>

            <NuxtLink to="/forget-password" class="login__form-footer">Forgot Password ?</NuxtLink>
        </div>
    </NuxtLayout>
</template>

<style lang="scss" scoped>
.login__form {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;

    &-header {
        font-weight: 700;
        font-size: 32px;
        line-height: 38px;
        color: #000000;
        margin-bottom: 32px;
    }

    form {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    &-footer {
        text-decoration: none;
        font-weight: 600;
        font-size: 18px;
        line-height: 22px;
        color: #3754DB;
        margin-top: 52px;
        cursor: pointer;
    }
}
</style>
