<script lang="ts" setup>
import { EContainer, EHead, EHr, EHtml, EPreview, ESection, EText } from "vue-email";

defineProps<{ name: string }>();

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

const hr = {
	borderColor: "#3754DB",
	margin: "20px 0",
};

const footer = {
	fontFamily,
	color: "#3754DB",
	fontSize: "12px",
};
</script>

<template>
	<e-html lang="en">
		<e-head />
		<e-preview preview="- Streamline Your Work, Boost Productivity!" />
		<e-section :style="main">
			<e-container :style="container">
				<e-text :style="paragraph">Thank you for signing up {{ name }}!</e-text>
				<e-text :style="paragraph">
					Welcome to XYZ! We are thrilled to have you on board and excited to help you streamline your work, boost productivity, and achieve your goals more efficiently than ever before.
					This email serves as a warm introduction to our platform, guiding you through the key features and providing you with essential information to get started.
				</e-text>
				<e-text :style="paragraph">
					XYZ is designed to simplify the way you manage tasks, projects, and collaborations. With our intuitive interface and powerful functionalities, you'll be able to organize, track,
					and prioritize your work effortlessly.
				</e-text>
				<e-text :style="paragraph">We look forward to being a part of your journey towards success!</e-text>
				<e-hr :style="hr" />
				<e-text :style="footer">Best regards, ABD</e-text>
			</e-container>
		</e-section>
	</e-html>
</template>
