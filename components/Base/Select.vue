<script lang="ts" setup>
import { emit } from 'process';

defineProps<{
    lists: [] | string[];
}>();

const emit = defineEmits(['selected']);

const selectedOption = ref("");
const selectOption = (option: string) => {
    selectedOption.value = option;
    emit("selected", option);
};
</script>

<template>
    <details class="dropdown">
        <summary class="dropdown-input">
            <span class="dropdown-input__label">{{ lists[0] }}</span>
            <span class="dropdown-input__arrow"></span>
        </summary>
        <div class="dropdown__modal">
            <div class="dropdown__modal-options">
                <button v-for="(option, index) in lists" :key="index" :class="{ active: selectedOption === option }" @click.native="selectOption(option)">{{ option }}</button>
            </div>
        </div>
    </details>
</template>

<style lang="scss" scoped>
.dropdown {
    position: relative;

    &-input {
        outline: none;
        border: 0.7px solid #A8ABBD;
        border-radius: 12px;
        padding: 15px;
        background: transparent;
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &__arrow {
            display: inline-block;
            width: 0;
            height: 0;
            vertical-align: middle;
            content: "";
            border-style: solid;
            border-width: 4px 4px 0;
            border-right-color: transparent;
            border-bottom-color: transparent;
            border-left-color: transparent;
        }
    }

    &__modal {
        position: absolute;
        top: 60px;
        left: 0;
        right: 0;
        background: #FFFFFF;
        box-shadow: 0px 12px 40px rgba(179, 179, 179, 0.1);
        border-radius: 16px;
        pointer-events: none;
        z-index: 99;

        &-options {
            padding: 25px 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;

            button {
                border: none;
                background: transparent;
                border-radius: 12px;
                padding: 15px;
                font-weight: 400;
                font-size: 16px;
                line-height: 19px;
                color: #000000;
                text-align: left;
                cursor: pointer;
            }

            .active {
                background: #F6F8FD;
            }
        }
    }
}
</style>
