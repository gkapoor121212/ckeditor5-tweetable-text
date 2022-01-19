/**
 * @module tweetable-text
 */

import { Plugin } from 'ckeditor5/src/core';

import TweetableTextEditing from './tweetabletextediting';
import TweetableTextUI from './tweetabletextui';

/**
 * The tweetable text plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * The {@link module:tweetable-text/tweetabletextediting~TweetableTextEditing tweetable text adding feature} and
 * * The {@link module:tweetable-text/tweetabletextui~TweetableTextUI tweetable text UI feature}
 *
 * @extends module:core/plugin~Plugin
 */
export default class TweetableText extends Plugin {
	/**
     * @inheritDoc
     */
	static get requires() {
		return [ TweetableTextEditing, TweetableTextUI ];
	}

	/**
     * @inheritDoc
     */
	static get pluginName() {
		return 'TweetableText';
	}
}
