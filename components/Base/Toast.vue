<script lang="ts" setup>
defineComponent({ name: 'Toast' });

const props = defineProps<Toast>();

const borderColor = ref("");
const color = ref("");

type ColorMap = {
    [key in string]: [string, string];
};

const background = computed(() => {
    const colorMap: ColorMap = {
        success: ['#00C271', '#FAFFFD'],
        error: ['#F7002B', '#FFFAFB'],
        warning: ['#FBBE37', '#FFFAFB'],
        info: ['#6684FF', '#FBFCFF']
    };
    if (props.toastStyle === 'solid' || props.toastStyle === 'outline') {
        const [bgColor, border] = colorMap[props.type];
        borderColor.value = border;
        color.value = "#FFFFFF";
        if (props.toastStyle === 'outline') {
            color.value = bgColor;
            borderColor.value = bgColor;
        }
        return bgColor;
    }
});
</script>

<template>
    <div class="toast"
        :style="`border: ${toastStyle === 'outline' ? `1.6px solid ${borderColor}` : 'none'}; color: ${color}; background: ${background}`">
        <div class="toast__icon">
            <IconsAlert :type="type" />
        </div>
        <div class="toast__content">
            <p>{{ message }}</p>
            <span>{{ description }}</span>
        </div>
        <button class="close-btn">
            <IconsClose />
        </button>
    </div>
</template>

<style lang="scss" scoped>
.toast {
    width: 100%;
    max-width: 350px;
    padding: 20px;
    border-radius: 20px;
    display: flex;
    align-items: center;

    &__icon {
        margin-right: 20px;
        background: #ffffff26;
        padding: 13px;
        border-radius: 50%;
    }

    &__content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        p {
            font-weight: 500;
            font-size: 18px;
            line-height: 22px;
            margin-bottom: 5px;
        }

        span {
            font-weight: 300;
            font-size: 12px;
            line-height: 14px;
        }
    }

    .close-btn {
        background: transparent;
        border: none;
        position: absolute;
        right: 20px;
        top: 20px;
        cursor: pointer;
        color: v-bind(color);
    }
}
</style>
