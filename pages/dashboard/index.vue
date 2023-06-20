<script lang="ts" setup>
definePageMeta({
	title: "Dashboard",
	name: "Dashboard",
	middleware: ["auth"],
});

const { user, tasks } = storeToRefs(useStore());
const { fetchTasks } = useStore();

// get work inspirational quotes
const getQuotes = async () => {
    const response = await fetch("https://type.fit/api/quotes");
    const data = await response.json();
    const randomQuote = data[Math.floor(Math.random() * data.length)];
    console.log("randomQuote => ", randomQuote);
};

await fetchTasks();
</script>

<template>
	<NuxtLayout name="dashboard">
		<div class="homepage">
			<div class="homepage-welcome">
				<h1>👋</h1>
				<div class="homepage-welcome__texts">
					<h2>Hi {{ user.name }},</h2>
					<p>Wecome to Semicolon Task Management</p>
				</div>
			</div>

			<div class="motivation-banner">
				<h4>Motivation to help you work.</h4>
				<div class="motivation-banner__ctas">
					<IconsClose class="close" />
					<button @click="getQuotes">Get Started</button>
				</div>
			</div>

			<GetStarted v-if="!user.profile_picture || tasks && tasks.length === 0" />
		</div>
	</NuxtLayout>
</template>

<style lang="scss" scoped>
.homepage {

	&-welcome {
		display: flex;
		align-items: stretch;
		gap: 18px;
		margin-bottom: 30px;

		h1 {
			font-weight: 600;
			font-size: 56px;
			line-height: 67px;

            @media screen and (max-width: 700px) {
                font-size: 36px;
                line-height: 43px;
            }
		}

		&__texts {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;

			h2 {
				font-weight: 600;
				font-size: 36px;
				line-height: 43px;
				color: #000000;

                @media screen and (max-width: 700px) {
                    font-size: 24px;
                    line-height: 29px;
                }
			}

			p {
				font-weight: 400;
				font-size: 20px;
				line-height: 24px;
				color: #636363;

                @media screen and (max-width: 700px) {
                    font-size: 16px;
                    line-height: 19px;
                }
			}
		}
	}

	.motivation-banner {
		margin-bottom: 30px;
		display: flex;
		justify-content: space-between;
		padding: 25px;
		background: linear-gradient(266.06deg, #0f1a4abf 1.1%, #00000060 81.65%, #00000060 109.25%);
		border-radius: 20px;
		height: 146px;

        @media screen and (max-width: 700px) {
            flex-direction: column;
        }

		h4 {
			width: 100%;
			max-width: 189px;
			font-weight: 600;
			font-size: 22px;
			line-height: 28px;
			color: #FFFFFF;
			margin: auto 0;
		}

		&__ctas {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: flex-end;

			.close {
				width: 24px;
				height: 24px;
				color: #FFFFFF;
				cursor: pointer;

                @media screen and (max-width: 700px) {
                    display: none;
                }
			}

			button {
				border: none;
				width: 150px;
				height: 40px;
				background: #3754DB;
				color: #FFFFFF;
				border-radius: 12px;
				font-weight: 500;
				font-size: 14px;
				line-height: 17px;
				cursor: pointer;
				box-shadow: #33373a33 0px 8px 24px;
			}
		}
	}
}
</style>
