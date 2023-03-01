<script lang="ts" setup>
definePageMeta({
    name: 'forget-password',
});

const resetCodesent = ref(false);

const sendResetCode = () => {
    resetCodesent.value = true;
}
</script>

<template>
    <div class="forget__pasword">
        <h5 class="forget__pasword-header">Forgot Password?</h5>
        <p class="forget__pasword-text">We are sorry to hear that happen. Don’t be sad, let's help you get back to
            productivity in no time.</p>

        <form @submit.prevent="sendResetCode">
            <FormInputText v-if="resetCodesent" input-type="number" placeholder="Enter OTP received" :required="true" />
            <FormInputText v-else input-type="email" label-for="email" label="Email Address" placeholder="Enter your email address" :required="true" />

            <FormInputButton width="204px" type="submit" :value="resetCodesent ? 'Recover Account.' : 'Next'" background="#3754DB" color="#FFFFFF" />
        </form>
    </div>
</template>

<style lang="scss" scoped>
.forget__pasword {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    &-header {
        font-weight: 600;
        font-size: 24px;
        line-height: 32px;
        color: #000000;
        margin-bottom: 12px;
    }

    &-text {
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        color: #676767;
        margin-bottom: 32px;
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
