<script lang="ts" setup>
definePageMeta({
	middleware: ["guest"],
});

navigateTo("/login");
</script>
