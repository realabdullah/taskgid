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
    <Toast v-if="showToast" :toast-style="toastStyle" :type="type" :message="message" :description="errorMessage" />
</template>
