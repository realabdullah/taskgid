<template>
	<SidebarProvider class="bg-surface-1">
		<AppSidebar />

		<SidebarInset class="bg-surface-1 relative">
			<div class="from-brand-hero-start pointer-events-none absolute inset-x-0 top-0 h-44 bg-linear-to-b to-transparent" />
			<AppHeader />
			<div class="bg-surface-1 relative z-10 flex-1 overflow-auto">
				<div class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
					<slot />
				</div>
			</div>

			<UserSettingsSheet />
		</SidebarInset>
	</SidebarProvider>
</template>
