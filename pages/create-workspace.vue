<script lang="ts" setup>
definePageMeta({
    title: 'Create Workspace',
    name: 'CreateWorkspace',
});

type Workspace = {
    name: string;
    description: string;
};

type WorkspaceState = string;

const workSpaceState = ref<WorkspaceState>('name');
const workspace = ref<Workspace>({
    name: '',
    description: ''
});

const pageHeadings = computed(() => {
    if (workSpaceState.value === 'name') {
        return {
            header: 'Create A Workspace.',
            description: 'A workspace is where your team members can collaborate on projects.'
        };
    } else {
        return {
            header: 'Add Workspace Description.',
            description: 'A workspace description is a short summary of what your workspace is about.'
        };
    }
});

const createWorkspace = (obj: Workspace) => {
    if (obj.name === '' || obj.description === '') return;
    console.log(obj);
};

const handleNext = () => {
    if (workSpaceState.value === 'name' && workspace.value.name !== '') {
        workSpaceState.value = 'description';
    } else {
        createWorkspace(workspace.value);
    }
};
</script>

<template>
    <NuxtLayout name="setup">
        <div class="workspace">
            <div class="workspace__create">
                <h1 class="workspace__create-header">{{ pageHeadings.header }}</h1>
                <p class="workspace__create-description">{{ pageHeadings.description }}</p>

                <div class="workspace__create-form">
                    <FormInputText v-if="workSpaceState === 'name'" v-model="workspace.name" input-type="text"
                        label-for="workspace-name" label="Workspace Name" />

                    <FormInputText v-else v-model="workspace.description" input-type="text" label-for="workspace-desc"
                        label="Workspace Description" />
                </div>

                <FormInputButton width="204px" type="button"
                    :value="workSpaceState === 'name' ? 'Next' : 'Create Workspace'" background="#3754DB" color="#FFFFFF"
                    @click="handleNext" />
            </div>
        </div>
    </NuxtLayout>
</template>

<style lang="scss" scoped>
.workspace {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;

    &__create {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;

        &-header {
            font-weight: 700;
            font-size: 28px;
            line-height: 34px;
            color: #000000;
            margin-bottom: 12px;
        }

        &-description {
            font-weight: 400;
            font-size: 16px;
            line-height: 19px;
            color: #62667E;
            margin-bottom: 32px;
        }

        &-form {
            width: 100%;
        }
    }
}
</style>
