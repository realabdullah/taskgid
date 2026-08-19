/**
 * A curated palette rather than the full Unicode set.
 *
 * A complete picker means shipping an emoji index and a sprite sheet; these are
 * the ones that actually appear in work conversation, and they render from the
 * system font with nothing to download.
 */
export const EMOJI_GROUPS: Array<{ label: string; emoji: string[] }> = [
	{
		label: "Reactions",
		emoji: ["👍", "👎", "👏", "🙌", "🙏", "💪", "🤝", "👀", "✅", "❌", "⚠️", "🚀"],
	},
	{
		label: "Faces",
		emoji: ["😀", "😄", "😅", "😂", "🙂", "😉", "😍", "🤔", "😐", "😴", "😬", "😅", "😭", "😱", "🤯", "🥳"],
	},
	{
		label: "Work",
		emoji: ["📌", "📝", "📎", "📊", "📅", "⏰", "🐛", "🔥", "💡", "🔧", "🧪", "🔒", "📦", "🎯", "♻️", "🧹"],
	},
	{
		label: "Hearts",
		emoji: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "✨", "⭐", "🎉"],
	},
];
