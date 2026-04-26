<script setup lang="ts">
import Placeholder from "@tiptap/extension-placeholder"
import StarterKit from "@tiptap/starter-kit"
import { EditorContent, useEditor } from "@tiptap/vue-3"

const props = defineProps<{
	modelValue?: string;
	placeholder?: string;
}>();

const emit = defineEmits<{
	(e: "update:modelValue", value: string): void;
}>();

const editor = useEditor({
	content: props.modelValue ?? "",
	extensions: [
		StarterKit,
		Placeholder.configure({
			placeholder: props.placeholder ?? "Write a description...",
		}),
	],
	editorProps: {
		attributes: {
			class: "prose prose-sm min-h-[120px] max-w-none w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-base text-text-primary shadow-xs outline-none transition-[color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
		},
	},
	onUpdate({ editor }) {
		const html = editor.getHTML();
		emit("update:modelValue", html === "<p></p>" ? "" : html);
	},
});

watch(
	() => props.modelValue,
	(value) => {
		if (!editor.value) return;
		const current = editor.value.getHTML();
		const normalized = current === "<p></p>" ? "" : current;
		if (value !== normalized) {
			editor.value.commands.setContent(value ?? "", { emitUpdate: false });
		}
	}
);

onBeforeUnmount(() => editor.value?.destroy());
</script>

<template>
	<div class="tiptap-wrapper">
		<div class="tiptap-toolbar border-border bg-surface-1 flex flex-wrap gap-1 rounded-t-md border border-b-0 px-2 py-1.5">
			<button
				type="button"
				class="hover:bg-surface-2 text-text-secondary hover:text-text-primary rounded px-2 py-0.5 text-sm font-bold transition-colors"
				:class="{ 'bg-surface-2 text-primary': editor?.isActive('bold') }"
				title="Bold"
				@click="editor?.chain().focus().toggleBold().run()"
			>
				B
			</button>
			<button
				type="button"
				class="hover:bg-surface-2 text-text-secondary hover:text-text-primary rounded px-2 py-0.5 text-sm italic transition-colors"
				:class="{ 'bg-surface-2 text-primary': editor?.isActive('italic') }"
				title="Italic"
				@click="editor?.chain().focus().toggleItalic().run()"
			>
				I
			</button>
			<button
				type="button"
				class="hover:bg-surface-2 text-text-secondary hover:text-text-primary rounded px-2 py-0.5 text-sm transition-colors line-through"
				:class="{ 'bg-surface-2 text-primary': editor?.isActive('strike') }"
				title="Strikethrough"
				@click="editor?.chain().focus().toggleStrike().run()"
			>
				S
			</button>
			<div class="bg-border mx-0.5 w-px self-stretch" />
			<button
				type="button"
				class="hover:bg-surface-2 text-text-secondary hover:text-text-primary rounded px-2 py-0.5 text-sm font-semibold transition-colors"
				:class="{ 'bg-surface-2 text-primary': editor?.isActive('heading', { level: 2 }) }"
				title="Heading"
				@click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
			>
				H2
			</button>
			<button
				type="button"
				class="hover:bg-surface-2 text-text-secondary hover:text-text-primary rounded px-2 py-0.5 text-sm font-semibold transition-colors"
				:class="{ 'bg-surface-2 text-primary': editor?.isActive('heading', { level: 3 }) }"
				title="Subheading"
				@click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
			>
				H3
			</button>
			<div class="bg-border mx-0.5 w-px self-stretch" />
			<button
				type="button"
				class="hover:bg-surface-2 text-text-secondary hover:text-text-primary rounded px-2 py-0.5 text-sm transition-colors"
				:class="{ 'bg-surface-2 text-primary': editor?.isActive('bulletList') }"
				title="Bullet list"
				@click="editor?.chain().focus().toggleBulletList().run()"
			>
				<Icon name="hugeicons:list-view" :size="14" />
			</button>
			<button
				type="button"
				class="hover:bg-surface-2 text-text-secondary hover:text-text-primary rounded px-2 py-0.5 text-sm transition-colors"
				:class="{ 'bg-surface-2 text-primary': editor?.isActive('orderedList') }"
				title="Ordered list"
				@click="editor?.chain().focus().toggleOrderedList().run()"
			>
				<Icon name="hugeicons:list-number" :size="14" />
			</button>
			<button
				type="button"
				class="hover:bg-surface-2 text-text-secondary hover:text-text-primary rounded px-2 py-0.5 text-sm transition-colors"
				:class="{ 'bg-surface-2 text-primary': editor?.isActive('blockquote') }"
				title="Blockquote"
				@click="editor?.chain().focus().toggleBlockquote().run()"
			>
				<Icon name="hugeicons:quote-down" :size="14" />
			</button>
			<button
				type="button"
				class="hover:bg-surface-2 text-text-secondary hover:text-text-primary rounded px-2 py-0.5 font-mono text-sm transition-colors"
				:class="{ 'bg-surface-2 text-primary': editor?.isActive('code') }"
				title="Inline code"
				@click="editor?.chain().focus().toggleCode().run()"
			>
				&lt;/&gt;
			</button>
		</div>
		<EditorContent :editor="editor" />
	</div>
</template>

<style>
.tiptap-wrapper .tiptap {
	min-height: 120px;
	outline: none;
	border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.tiptap-wrapper .tiptap:focus {
	border-color: var(--color-primary);
	box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.tiptap-wrapper .tiptap p.is-editor-empty:first-child::before {
	color: var(--color-text-tertiary);
	content: attr(data-placeholder);
	float: left;
	height: 0;
	pointer-events: none;
}

.tiptap-wrapper .tiptap h2 {
	font-size: 1.1em;
	font-weight: 700;
	margin: 0.75em 0 0.25em;
}

.tiptap-wrapper .tiptap h3 {
	font-size: 1em;
	font-weight: 600;
	margin: 0.5em 0 0.25em;
}

.tiptap-wrapper .tiptap ul,
.tiptap-wrapper .tiptap ol {
	padding-left: 1.25em;
	margin: 0.25em 0;
}

.tiptap-wrapper .tiptap ul {
	list-style: disc;
}

.tiptap-wrapper .tiptap ol {
	list-style: decimal;
}

.tiptap-wrapper .tiptap blockquote {
	border-left: 3px solid var(--color-border);
	padding-left: 0.75em;
	color: var(--color-text-secondary);
	margin: 0.5em 0;
}

.tiptap-wrapper .tiptap code {
	background: var(--color-surface-2);
	border-radius: 3px;
	font-size: 0.875em;
	padding: 0.1em 0.3em;
}
</style>
