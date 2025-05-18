<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
defineProps<{ totalMembers?: number }>();

const src = defineModel<{ [key: string]: any }>({ default: {} });

const filter = shallowReactive({ ...src.value });

const activeFilterCount = computed(() => {
	return Object.values(src.value).filter((v) => {
		if (typeof v === "string") {
			return v.trim() !== "";
		}
		if (typeof v === "number") {
			return !isNaN(v);
		}
		return false;
	}).length;
});

const resetFilters = () => {
	for (const key in filter) {
		const value = filter[key as keyof typeof filter];
		filter[key as keyof typeof filter] = typeof value === "string" ? "" : 0;
	}
	applyFilters();
};
const applyFilters = () => Object.assign(src.value, filter);
</script>

<template>
	<div class="flex items-center gap-2">
		<Popover>
			<PopoverTrigger as-child>
				<Button variant="outline" size="sm" class="h-8 gap-1">
					<Icon name="hugeicons:filter" :size="16" />
					<span class="sr-only">Filter</span>
					<Badge v-if="activeFilterCount > 0" variant="secondary" class="ml-1 rounded-full px-1 py-0 text-xs"> {{ activeFilterCount }} </Badge>
				</Button>
			</PopoverTrigger>

			<PopoverContent class="w-[340px] p-0" align="start">
				<div class="space-y-2 p-4">
					<h4 class="leading-none font-medium">Filter Team Members</h4>
					<p class="text-muted-foreground text-sm">Showing {{ totalMembers || 0 }} team members</p>
				</div>

				<Separator />

				<div class="space-y-3 p-3">
					<!-- ROLE -->
					<div class="space-y-2">
						<Label html-for="role">Filter by role</Label>
						<Select v-model="filter.role">
							<SelectTrigger id="role" class="w-full">
								<SelectValue placeholder="Select role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All roles</SelectItem>
								<SelectItem value="creator">Creator</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="member">Member</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<!-- ASSIGNMENT COUNTS -->
					<div class="space-y-4">
						<div class="grid grid-cols-2 gap-2">
							<div class="space-y-2">
								<Label html-for="minTasksAssigned">Min Tasks Assigned</Label>
								<Input id="minTasksAssigned" v-model="filter.minTasksAssigned" type="number" placeholder="Min" />
							</div>
							<div class="space-y-2">
								<Label html-for="maxTasksAssigned">Max Tasks Assigned</Label>
								<Input id="maxTasksAssigned" v-model="filter.maxTasksAssigned" type="number" placeholder="Max" />
							</div>
						</div>

						<div class="grid grid-cols-2 gap-2">
							<div class="space-y-2">
								<Label html-for="minTasksCompleted">Min Tasks Completed</Label>
								<Input id="minTasksCompleted" v-model="filter.minTasksCompleted" type="number" placeholder="Min" />
							</div>
							<div class="space-y-2">
								<Label html-for="maxTasksCompleted">Max Tasks Completed</Label>
								<Input id="maxTasksCompleted" v-model="filter.maxTasksCompleted" type="number" placeholder="Max" />
							</div>
						</div>
					</div>

					<!-- SORT -->
					<div class="space-y-4">
						<!-- SORT BY -->
						<div class="space-y-2">
							<Label html-for="sortBy">Sort by</Label>
							<Select v-model="filter.sortBy">
								<SelectTrigger id="sortBy" class="w-full">
									<SelectValue placeholder="Select field" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="firstName">First Name</SelectItem>
									<SelectItem value="lastName">Last Name</SelectItem>
									<SelectItem value="email">Email</SelectItem>
									<SelectItem value="username">Username</SelectItem>
									<SelectItem value="title">Title</SelectItem>
									<SelectItem value="location">Location</SelectItem>
									<SelectItem value="createdAt">Date Joined</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<!-- SORT ORDER -->
						<div class="space-y-2">
							<Label html-for="sortOrder">Sort order</Label>
							<Select v-model="filter.sortOrder">
								<SelectTrigger id="sortOrder" class="w-full">
									<SelectValue placeholder="Select order" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ASC">
										<div class="flex items-center">
											<Icon name="hugeicons:sort-by-up-02" :size="16" class="mr-2" />
											Ascending
										</div>
									</SelectItem>
									<SelectItem value="DESC">
										<div class="flex items-center">
											<Icon name="hugeicons:sort-by-down-02" :size="16" class="mr-2" />
											Descending
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div class="bg-muted/50 flex items-center justify-between p-4">
						<Button variant="ghost" size="sm" @click="resetFilters"> Reset filters </Button>
						<Button size="sm" @click="applyFilters"> Apply filters </Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>

		<Button v-if="activeFilterCount > 0" variant="ghost" size="sm" class="text-muted-foreground h-8 px-2" @click="resetFilters">
			<Icon name="hugeicons:cancel-01" :size="14" class="mr-1" />
			Clear filters
		</Button>
	</div>
</template>
