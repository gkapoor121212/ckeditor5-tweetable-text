/**
 * @module tweetable-text
 */

import Command from "@ckeditor/ckeditor5-core/src/command";

export default class TweetableTextCommand extends Command {
	execute({ value }) {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		editor.model.change(writer => {
			// Create a <placeholder> elment with the "name" attribute (and all the selection attributes)...
			const tweetableText = writer.createElement("tweetableText", {
				...Object.fromEntries(selection.getAttributes()),
				displayText: value.displayText,
				tweetableTextVal: value.tweetableTextVal
			});

			// ... and insert it into the document.
			editor.model.insertContent(tweetableText);

			// Put the selection on the inserted element.
			writer.setSelection(tweetableText, "on");
		});
	}
}
