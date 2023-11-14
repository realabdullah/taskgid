<script lang="ts" setup>
definePageMeta({
	middleware: ["accept-invite"],
});
</script>

<style lang="scss" scoped>
.modal {
	padding: 3rem;
	gap: 3rem;

	p {
		@include font(1.8rem, 2.4rem);
	}
}
</style>
