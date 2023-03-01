<script lang="ts" setup>
definePageMeta({
    name: 'signup',
});

const signUp = () => {
    console.log('sign up');
};
</script>

<template>
    <NuxtLayout name="auth">
        <template #cta>Log In</template>
        <div class="signup__form">
            <h5 class="signup__form-header">Create an Account</h5>
            <p class="signup__form-description">It’s Simpe and Easy!!</p>

            <form @submit.prevent="signUp">
                <FormInputText input-type="text" label-for="name" label="Fullname" placeholder="Enter fullname"
                    hint="Information about the input" />

                <FormInputText input-type="email" label-for="email" label="Email Address" placeholder="Enter email address"
                    hint="Example. mano@gmail.com" />

                <FormInputText input-type="password" label-for="password" label="Enter A Password" placeholder="Password"
                    hint="Upto 8 characters with an Uppercase, symbol and number" />

                <FormInputButton width="100%" type="submit" value="Create Account" background="#3754DB" color="#FFFFFF" />
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
