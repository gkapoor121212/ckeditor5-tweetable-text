/**
 * @module tweetable-text
 */

import { Plugin } from 'ckeditor5/src/core';

import TweetableTextCommand from './tweetabletextcommand';
import { toWidget, viewToModelPositionOutsideModelElement } from 'ckeditor5/src/widget';
import { Widget } from 'ckeditor5/src/widget';

/**
 * The tweetable text editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TweetableTextEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Widget ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._defineSchema();
		this._defineConverters();
		this.editor.commands.add('tweetableText', new TweetableTextCommand(this.editor));
		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement(this.editor.model, viewElement => viewElement.hasClass('tweetableText'))
		);
	}

	/**
	 * Defines schema for the plugin.
	 */
	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register('tweetableText', {
			allowWhere: '$text',
			isInline: true,
			isObject: true,
			allowAttributesOf: '$text',
			allowAttributes: [ 'displayText', 'tweetableTextVal' ]
		});
	}

	/**
	 * Defines converters for the plugin.
	 */
	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for('upcast').elementToElement({
			view: {
				name: 'span',
				classes: [ 'tweetableText' ]
			},
			model: (viewElement, { writer: modelWriter }) => {
				const displayText = viewElement.getChild(0).data.slice(1, -1);
				const tweetableTextVal = viewElement.getChild(0).data.slice(1, -1);

				return modelWriter.createElement('tweetableText', { displayText, tweetableTextVal });
			}
		});

		conversion.for('editingDowncast').elementToElement({
			model: 'tweetableText',
			view: (modelItem, { writer: viewWriter }) => {
				const widgetElement = createTweetableTextView(modelItem, viewWriter);

				return toWidget(widgetElement, viewWriter);
			}
		});

		conversion.for('dataDowncast').elementToElement({
			model: 'tweetableText',
			view: (modelItem, { writer: viewWriter }) => createTweetableTextView(modelItem, viewWriter)
		});

		function createTweetableTextView(modelItem, viewWriter) {
			const displayText = modelItem.getAttribute('displayText');
			const tweetableTextVal = modelItem.getAttribute('tweetableTextVal');

			// Logic to convert input into a tweetable text.
			const twitterBaseUrl = 'https://twitter.com/intent/tweet?';
			const encodedValue = encodeURI( tweetableTextVal );
			const linkUrl = twitterBaseUrl + 'text=' + encodedValue;

			// Generate link element for the required Twitter link.
			const linkElement = viewWriter.createAttributeElement( 'a', { href:linkUrl }, { priority: 5 } );

			// Generate a wrapping span element around tweetable text.
			viewWriter.insert(linkElement);
			const tweetableTextView = viewWriter.createContainerElement('span', {
				class: 'tweetableText'
			}, {
				isAllowedInsideAttributeElement: true
			});

			// Generate display text and insert it in the view.
			const innerText = viewWriter.createText(displayText);
			viewWriter.insert(viewWriter.createPositionAt( tweetableTextView, 0), innerText);

			return tweetableTextView;
		}
	}
}
