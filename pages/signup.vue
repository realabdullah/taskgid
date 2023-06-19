<script lang="ts" setup>
import bcrypt from 'bcryptjs';

definePageMeta({
    title: 'Sign Up',
    name: 'signup',
    middleware: ['guest']
});

const name = ref('');
const email = ref('');
const password = ref('');
const submitting = ref(false);

const { addUser } = useUser();
const { sendWelcomeEmail } = useEmail();

const signUp = async () => {
    submitting.value = true;
    const salt = bcrypt.genSaltSync(10);
    const user: User = {
        id: window.crypto.randomUUID(),
        name: name.value,
        email: email.value,
        password: bcrypt.hashSync(password.value, salt),
        username: name.value.toLowerCase().replace(/\s/g, ''),
        profile_picture: 'https://ui-avatars.com/api/?name=' + name.value,
    }
    const status = await addUser(user);
    await sendWelcomeEmail(email.value, name.value);
    const cookie = useCookie("user_id");
    cookie.value = user.id;
    status ? navigateTo('/create-workspace') : submitting.value = false;
};
</script>

<template>
    <NuxtLayout name="auth">
        <template #cta>Log In</template>
        <div class="signup__form">
            <h5 class="signup__form-header">Create an Account</h5>
            <p class="signup__form-description">It’s Simpe and Easy!!</p>

            <form @submit.prevent="signUp">
                <BaseInput v-model="name" input-type="text" label-for="name" label="Fullname"
                    placeholder="Enter fullname" hint="Information about the input" border-color="#2746D8" />

                <BaseInput v-model="email" input-type="email" label-for="email" label="Email Address"
                    placeholder="Enter email address" hint="Example. mano@gmail.com" border-color="#2746D8" />

                <BaseInput v-model="password" input-type="password" label-for="password" label="Enter A Password"
                    placeholder="Password" hint="Upto 8 characters with an Uppercase, symbol and number" border-color="#2746D8" />

                <BaseButton width="100%" :value="submitting ? 'loading' : 'Create Account'" background="#3754DB" color="#FFFFFF" />
            </form>
        </div>
    </NuxtLayout>
</template>

<style lang="scss" scoped>
.signup__form {
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
        margin-bottom: 12px;
    }

    &-description {
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        color: #62667E;
        margin-bottom: 48px;
    }

    form {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
}
</style>
