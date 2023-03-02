<template>
    <div class="setup__layout">
        <div class="setup__layout-left">
            <h2 class="setup__text">Your Enviroment your Will.</h2>
        </div>
        <div class="setup__layout-right">
            <slot />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.setup__layout {
    background-color: #FFFFFF;
    padding: 20px;
    display: flex;

    &-left {
        flex-basis: 40%;
        flex-grow: 1;
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
        border-radius: 32px;

        .setup__text {
            align-self: center;
            font-weight: 600;
            font-size: 56px;
            line-height: 66px;
            letter-spacing: -0.02em;
            color: #FFFFFF;
            max-width: 454px;
            margin: auto;
        }
    }

    &-right {
        flex-basis: 60%;
        flex-grow: 1;
    }
}
</style>