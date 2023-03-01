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
                <label for="name">
                    <span class="form-label">Fullname</span>
                    <input type="text" name="name" id="name" placeholder="Enter fullname" />
                    <span class="form-hint">Information about the input</span>
                </label>

                <label for="email">
                    <span class="form-label">Email Address</span>
                    <input type="email" name="email" id="email" placeholder="Enter email address" />
                    <span class="form-hint">Example. mano@gmail.com</span>
                </label>

                <label for="password">
                    <span class="form-label">Enter A Password</span>
                    <input type="password" name="password" id="password" placeholder="Password" />
                    <span class="form-hint">Upto 8 characters with an Uppercase, symbol and number</span>
                </label>

                <input class="submit-btn" type="submit" value="Create Account">
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
        font-size: pxToRem(32);
        line-height: pxToRem(38);
        color: $colorBlack;
        margin-bottom: pxToRem(12);
    }

    &-description {
        font-weight: 400;
        font-size: pxToRem(16);
        line-height: pxToRem(19);
        color: $colorGrey;
        margin-bottom: pxToRem(48);
    }

    form {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        label {
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            margin-bottom: 24px;

            .form-label {
                font-weight: 400;
                font-size: 16px;
                line-height: 19px;
                color: #2C2E3A;
                margin-bottom: 14px;
            }

            input {
                width: -webkit-fill-available;
                background: #FBFBFE;
                border: 0.6px solid #2746D8;
                border-radius: 12px;
                padding: 15px;
                font-weight: 400;
                font-size: 16px;
                line-height: 19px;
                color: #13236C;
                margin-bottom: 8px;

                &::placeholder {
                    color: #13236C;
                }
            }


            .form-hint {
                font-weight: 400;
                font-size: 12px;
                line-height: 14px;
                color: #6E7391;
                display: block;
            }
        }

        .submit-btn {
            width: 100%;
            padding: 15px;
            background: #3754DB;
            border: none;
            border-radius: 12px;
            font-weight: 500;
            font-size: 16px;
            line-height: 19px;
            color: #FFFFFF;
            margin-top: 24px;

            &:hover {
                cursor: pointer;
                background: #3755dbe5;
            }
        }
    }
}
</style>
