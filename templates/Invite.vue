<script lang="ts" setup>
import { EContainer, EHead, EHtml, EPreview, ESection, EText, ELink } from "vue-email";

const config = useRuntimeConfig();

const { name, token } = defineProps<{
	name: string;
	token: string;
}>();

const inviteLink = computed(() => `${config.public.baseUrl}/accept/${token}`);

const fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';

const main = {
	backgroundColor: "#F5F7FE",
	padding: "20px 48px",
};

const container = {
	margin: "0 auto",
	width: "100%",
};

const paragraph = {
	fontFamily,
	fontSize: "16px",
	lineHeight: "26px",
};
</script>

<template>
	<e-html lang="en">
		<e-head />
		<e-preview :preview="`You've Been Invited by ${name} to join their workspace on Ergosphere`" />
		<e-section :style="main">
			<e-container :style="container">
				<e-text :style="paragraph">Hi there!</e-text>
				<e-text :style="paragraph">You've been invited by {{ name }} to join their workspace on Ergosphere, a powerful task management web application.</e-text>
				<e-text :style="paragraph">
					Ergosphere is a collaborative platform designed to streamline work and enhance productivity. Your contributions to this workspace are highly anticipated.
				</e-text>
				<e-text :style="paragraph">To accept this invitation and get started, simply click on the link below:</e-text>
				<e-link :href="inviteLink">Accept Invitation</e-link>
				<e-text :style="paragraph">We can't wait to welcome you to our workspace and make task management a breeze!</e-text>
			</e-container>
		</e-section>
	</e-html>
</template>
