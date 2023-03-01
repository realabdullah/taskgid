<script lang="ts" setup>
const route = useRoute();
const router = useRouter();

const goTo = (path: string) => {
    return path === "/login" 
    ? router.push("/signup") 
    : router.push("/login");
};
</script>

<template>
    <div class="auth__layout">
        <div class="auth__layout-left">
            <h2 class="auth__text">Take your productivity to the next level.</h2>
            <p class="copyright">Copyright 2021 | All  Right Reserved</p>
        </div>
        <div class="auth__layout-right">
            <slot />
        </div>

        <div class="auth-cta">
            <button @click="goTo(route.path)">
                <slot name="cta" />
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.auth__layout {
    background-color: $colorWhite;
    padding: pxToRem(20);
    display: grid;
    grid-template-columns: 1.5fr 2fr;
    position: relative;

    .auth-cta {
        position: absolute;
        top: 44px;
        right: 120px;

        button {
            width: 180px;
            background: #FFFFFF;
            border-radius: 12px;
            padding: 15px 30px;
            color: #3754DB;
            font-weight: 500;
            font-size: 16px;
            line-height: 19px;
            border: 1.7px solid #3754DB;
            cursor: pointer;
        }
    }

    &-left {
        width: 100%;
        min-height: 95vh;
        height: 100%;
        background-image: url('~/assets/images/authleft.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-radius: pxToRem(32);
        
        .auth__text {
            align-self: center;
            font-weight: 600;
            font-size: pxToRem(56);
            line-height: pxToRem(66);
            letter-spacing: -0.02em;
            color: $colorWhite;
            max-width: pxToRem(454);
            margin: auto;
        }

        .copyright {
            align-self: flex-start;
            font-weight: 400;
            font-size: pxToRem(20);
            line-height: pxToRem(66);
            color: $colorWhite;
            max-width: pxToRem(454);
            margin: 0 auto;
        }
    }
}
</style>
