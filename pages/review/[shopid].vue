<script setup lang="ts">
const shopId = useRoute().params.shopid;
</script>

<template>
	<div>
		<h1>Review for shop {{ shopId }}</h1>
	</div>
</template>
