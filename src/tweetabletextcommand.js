/**
 * @module tweetable-text
 */

import { Command } from 'ckeditor5/src/core';

/**
 * The insert tweetable text command.
 *
 * The command is registered by the {@link module:tweetable-text/tweetabletextediting~TweetableTextEditing} as `'tweetableText'`.
 *
 * To insert tweetable text at the current selection, execute the command, specify the display text and tweetable text value:
 *
 *		editor.execute( 'tweetableText', 'My display text', 'My tweeted text' );
 *
 * @extends module:core/command~Command
 */

export default class TweetableTextCommand extends Command {
	/**
	 * Executes the command, which:
	 *
	 * * inserts tweetable text and puts the selection around it.
	 *
	 * @fires execute
	 * @param {String} displayText The display text.
	 * @param {String} tweetableTextVal The text which will be tweeted.
	 */
	execute( displayText, tweetableTextVal ) {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		editor.model.change(writer => {
			const tweetableText = writer.createElement('tweetableText', {
				...Object.fromEntries(selection.getAttributes()),
				displayText: displayText,
				tweetableTextVal: tweetableTextVal
			});

			editor.model.insertContent( tweetableText );

			writer.setSelection( tweetableText, 'on' );
		});
	}
}
