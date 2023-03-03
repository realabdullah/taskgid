<script lang="ts" setup>
import { type } from 'os';

definePageMeta({
    name: 'login',
});

type Login = {
    email: string;
    password: string;
};

const login = ref<Login>({
    email: '',
    password: ''
});

const submitForm = (login: Login) => {
    if (login.email === '' || login.password === '') return;
    console.log(login);
};
</script>

<template>
    <NuxtLayout name="auth">
        <template #cta>Create Account</template>
        <div class="login__form">
            <h5 class="login__form-header">Welcome Back.</h5>

            <form @submit.prevent="submitForm(login)">
                <FormInputText v-model="login.email" input-type="email" label-for="email" label="Email Address" placeholder="anon@anon.anon"
                    hint="Example. mano@gmail.com" />

                <FormInputText v-model="login.password" input-type="password" label-for="password" label="Enter Your Password"
                    placeholder="Enter password" hint="Upto 8 characters with an Uppercase, symbol and number" />

                <FormInputButton width="204px" type="submit" value="Log In" background="#3754DB" color="#FFFFFF" />
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
