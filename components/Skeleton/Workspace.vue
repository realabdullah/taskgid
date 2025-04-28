<template>
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<Card v-for="item in 3" :key="item" class="justify-between overflow-hidden pb-0">
			<CardHeader class="pb-3">
				<div class="flex items-center justify-between">
					<Skeleton class="h-4 w-[120px]" />
					<Skeleton class="h-4 w-4" />
				</div>
				<Skeleton class="h-4 w-[430px]" />
				<Skeleton class="h-4 w-[430px]" />
			</CardHeader>
			<CardContent>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Skeleton class="h-4 w-4" />
						<Skeleton class="h-4 w-[62px]" />
					</div>
					<Skeleton class="h-[22px] w-[75px]" />
				</div>
			</CardContent>
			<CardFooter class="bg-muted/50 border-t px-6 py-3">
				<div class="text-muted-foreground flex w-full items-center justify-between text-xs">
					<span></span>
					<Skeleton class="h-7 w-[53px]" />
				</div>
			</CardFooter>
		</Card>
	</div>
</template>
