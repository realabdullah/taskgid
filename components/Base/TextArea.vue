<script lang="ts" setup>
defineProps<{
    label: string;
    name: string;
    placeholder: string;
    modelValue: string;
    borderColor: string;
    required: boolean;
}>();
</script>

<template>
    <label :for="name">
        <span v-if="!!label" class="form-label">{{ label }}</span>
        <textarea :name="name" :id="name" :placeholder="placeholder" :value="modelValue" :required="required" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"></textarea>
    </label>
</template>

<style lang="scss" scoped>
label {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;

    .form-label {
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        color: #2C2E3A;
        margin-bottom: 14px;
    }

    textarea {
        width: -webkit-fill-available;
        height: 120px;
        border: 0.7px solid #A8ABBD;
        border-radius: 12px;
        padding: 16px;
        font-family: 'Gelion', sans-serif;
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        color: #4D5163;
        resize: none;
    }
}  
</style>
