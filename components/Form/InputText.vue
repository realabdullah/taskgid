<script lang="ts" setup>
interface inputTextProps {
    labelFor?: string;
    label?: string;
    inputType: string;
    placeholder?: string;
    hint?: string;
    required?: boolean;
}

defineProps<inputTextProps>();
</script>

<template>
    <label :for="labelFor">
        <span v-if="!!label" class="form-label">{{ label }}</span>
        <input :type="inputType" :name="labelFor" :id="labelFor" :placeholder="placeholder" :required="required" />
        <span v-if="!!hint" class="form-hint">{{ hint }}</span>

        <span v-if="inputType === 'password'" class="eye">
            <IconsEye />
        </span>
    </label>
</template>

<style lang="scss" scoped>
label {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    position: relative;

    &:not(:last-child) {
        margin-bottom: 24px;
    }

    .eye {
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-25%);
        cursor: pointer;
    }

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
</style>
