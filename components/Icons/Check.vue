<script lang="ts" setup>
defineProps<{
    variant: string;
}>();
</script>

<template>
    <svg v-if="variant === 'large'" width="86" height="86" viewBox="0 0 86 86" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="86" height="86" rx="20" fill="#00C271" />
        <path
            d="M59.6667 41.4668V43.0002C59.6646 46.5942 58.5008 50.0913 56.3489 52.9699C54.197 55.8485 51.1722 57.9543 47.7256 58.9733C44.2791 59.9924 40.5954 59.87 37.2241 58.6245C33.8528 57.379 30.9744 55.077 29.0183 52.062C27.0621 49.0469 26.133 45.4803 26.3695 41.894C26.6059 38.3078 27.9954 34.8941 30.3305 32.162C32.6656 29.4299 35.8213 27.5258 39.327 26.7338C42.8327 25.9417 46.5005 26.3041 49.7834 27.7668"
            stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M59.9444 28.8333L43.2778 45.5166L38.2778 40.5166" stroke="white" stroke-width="2.5" stroke-linecap="round"
            stroke-linejoin="round" />
    </svg>
</template>
