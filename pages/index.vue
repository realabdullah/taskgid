<script lang="ts" setup>
interface FormObj {
    email: string;
    submittedEmail: string;
    status: "success" | "fail" | "exists" | null;
}

const isLoading = ref(false);
const form = reactive<FormObj>({
    email: "",
    submittedEmail: "",
    status: null
})
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const clearAll = () => {
    form.submittedEmail = "";
    form.status = null;
}

const requestToJoin = async () => {
    try {
        isLoading.value = true;
        const { data, error } = await useFetch("/api/join-waitlist", {
            method: "POST",
            body: { email: form.email }
        });
        form.submittedEmail = form.email;
        if (error.value || !data.value) throw new Error("an error occured!");
        else if (data.value.status !== "fail") form.email = "";
        form.status = data.value.status;
        isLoading.value = false;
        setTimeout(() => clearAll(), 7000)
    } catch (error) {
        form.status = "fail";
        isLoading.value = false;
        setTimeout(() => clearAll(), 7000)
    }
}
</script>


<template>
    <div class="wrapper">
        <h4>Taskgid <div class="shadow"></div>
        </h4>
        <p>Join the wait-list<br /> <span> for Exclusive Access</span></p>

        <form @submit.prevent="requestToJoin">
            <label for="email">
                <input v-model="form.email" type="email" placeholder="Email address" required />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="16">
                    <path
                        d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM20 7.23792L12.0718 14.338L4 7.21594V19H20V7.23792ZM4.51146 5L12.0619 11.662L19.501 5H4.51146Z">
                    </path>
                </svg>
            </label>

            <button type="submit" :disabled="isLoading || !form.email.match(emailRegex)">
                <span v-if="isLoading" class="loader"></span>
                <template v-else>Join the waitlist
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path
                            d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z">
                        </path>
                    </svg></template>
            </button>
        </form>

        <div v-if="form.status !== null" class="success">
            <div>
                <svg v-if="form.status === 'exists'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20"
                    height="20" fill="rgba(70,146,221,1)">
                    <path
                        d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 11V17H13V11H11ZM11 7V9H13V7H11Z">
                    </path>
                </svg>
                <svg v-else-if="form.status === 'fail'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20"
                    height="20" fill="rgba(231,23,37,1)">
                    <path
                        d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z">
                    </path>
                </svg>
                <svg v-else-if="form.status === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20"
                    height="20" fill="rgba(100,205,138,1)">
                    <path
                        d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11.0026 16L18.0737 8.92893L16.6595 7.51472L11.0026 13.1716L8.17421 10.3431L6.75999 11.7574L11.0026 16Z">
                    </path>
                </svg>
            </div>
            <span v-if="form.status === 'exists'">The email you provided has already been added to our waitlist! An email
                will be sent once Taskgid is open to you.</span>
            <span v-else-if="form.status === 'fail'">Something went wrong! We couldn't add added <span class="email">{{
                form.submittedEmail }}</span> to our waitlist. Please
                try
                again or send us <a href="mailto:support@tasgid.xyz">mail</a> if issue persists!</span>
            <span v-else-if="form.status === 'success'">We've added <span class="email">{{ form.submittedEmail }}</span> to
                our waitlist. A confirmation
                email
                has been sent and one will be sent when Taskgid is opened to you!</span>

            <button class="close" @click="clearAll">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12"
                    fill="rgba(255,255,255,1)">
                    <path
                        d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z">
                    </path>
                </svg>
            </button>
        </div>
    </div>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Raleway', sans-serif;
}

.wrapper {
    padding: 3rem;
    background-color: #0b0d12;
    width: 100%;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    h4 {
        position: absolute;
        top: 40px;
        background: -webkit-linear-gradient(#d9d9dd, #262a34);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 1.5rem;

        .shadow {
            box-shadow: #8ba0b791 0px 9px 90px 35px;
        }
    }

    p {
        color: #aeaeb1;
        text-align: center;
        font-size: clamp(0.5rem, 3.464vw + 0.354rem, 1.5rem);


        span {
            background: -webkit-linear-gradient(#262a34, #d9d9dd);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: clamp(1.25rem, 3.464vw + 0.354rem, 3.125rem);
            line-height: clamp(1.873rem, 4.046vw + 0.826rem, 4.063rem);
        }
    }

    form {
        width: 100%;
        max-width: 500px;
        height: auto;
        margin: 20px auto;
        margin-top: 40px;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;

        label {
            width: 100%;
            max-width: 400px;

            position: relative;

            svg {
                position: absolute;
                top: 50%;
                left: 10px;
                transform: translate(0, -50%);
                fill: #474651;
            }

            input {
                width: 100%;
                border: none;
                outline: none;
                background: #191920;
                color: #F1F1F1;
                padding: 15px;
                padding-left: 40px;
                border-radius: 5px;
                font-size: 16px;

                &::placeholder {
                    color: #474651;
                }

                &:focus {
                    border: 1px solid #F1F1F1;
                    transition: border 0.2s ease-in-out;
                }

                &:focus+svg {
                    fill: #F1F1F1;
                    transition: fill 0.2s ease-in-out;
                }
            }
        }

        button {
            position: relative;

            width: 100%;
            max-width: 400px;
            border: none;
            outline: none;
            background: #21212a;
            color: #F1F1F1;
            padding: 15px;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.2s ease-in;

            display: flex;
            align-items: center;
            justify-content: center;

            &:disabled {
                background: #191920;
                color: #474651;
                cursor: not-allowed;
            }

            svg {
                position: absolute;
                top: 50%;
                right: 15px;
                transform: translate(0, -50%);
            }

            .loader {
                width: 15px;
                height: 15px;
                border: 2px solid #F1F1F1;
                border-bottom-color: #191920;
                border-radius: 50%;
                display: inline-block;
                box-sizing: border-box;
                animation: rotation 1s linear infinite;
            }

            @keyframes rotation {
                0% {
                    transform: rotate(0deg);
                }

                100% {
                    transform: rotate(360deg);
                }
            }
        }
    }

    .success {
        position: relative;

        width: 100%;
        max-width: 400px;
        height: auto;
        margin: 20px auto;
        border: 0.5px solid #474651;
        border-radius: 5px;
        padding: 10px;
        padding-right: 30px;

        display: flex;
        align-items: flex-start;
        gap: 10px;

        span {
            color: #aeaeb1;
            font-size: 0.9rem;

            .email,
            a {
                color: #F1F1F1;
            }
        }

        .close {
            border: none;
            outline: none;
            background: transparent;
            cursor: pointer;

            position: absolute;
            top: 10px;
            right: 10px;
        }
    }
}
</style>
