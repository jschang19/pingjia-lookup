<template>
	<div>
		<UContainer>
			<PageContainer>
				<NuxtPage />
			</PageContainer>
		</UContainer>
		<ClientOnly>
			<UNotifications />
		</ClientOnly>
	</div>
</template>
