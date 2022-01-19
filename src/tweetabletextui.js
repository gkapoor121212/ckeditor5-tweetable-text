/**
 * @module tweetable-text
 */

import { Plugin } from 'ckeditor5/src/core';
import { createDropdown } from 'ckeditor5/src/ui';
import TweetableTextFormView from './ui/tweetabletextformview';
import tweetableTextIcon from '../theme/icons/tweetableText.svg';

/**
 * The tweetable text UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TweetableTextUI extends Plugin {
    /**
     * @inheritDoc
     */
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add('tweetableText', locale => {
			const dropdownView = createDropdown(locale);

			const tweetableTextForm = new TweetableTextFormView(getFormValidators(editor.t), editor.locale);
			const command = editor.commands.get('tweetableText');

			this._setUpDropdown(dropdownView, tweetableTextForm, command, editor);
			this._setUpForm(dropdownView, tweetableTextForm, command);

			return dropdownView;
		});
	}

    /**
     * Setup dropdown for the plugin.
     */
	_setUpDropdown(dropdown, form, command) {
		const editor = this.editor;
		const button = dropdown.buttonView;

		dropdown.bind('isEnabled').to(command);
		dropdown.panelView.children.add(form);

		button.set({
			label: 'Tweetable Text',
			icon: tweetableTextIcon,
			tooltip: true
		});

		button.on('open', () => {
			editor.editing.view.focus();
			form.disableCssTransitions();
			form.focus();
			form.enableCssTransitions();
		}, { priority: 'low' });

		dropdown.on('submit', () => {
			if (form.isValid()) {
				editor.execute('tweetableText', form.displayText, form.tweetableTextVal);
				closeUI();
			}
		});

		dropdown.on('change:isOpen', () => form.resetFormStatus());
		dropdown.on('cancel', () => closeUI());

		function closeUI() {
			editor.editing.view.focus();
			dropdown.isOpen = false;
		}
	}

    /**
     * Setup form for the plugin inputs.
     */
	_setUpForm(dropdown, form, command) {
		form.delegate('submit', 'cancel').to(dropdown);
		form.displayTextInputView.bind('value').to(command, 'value');

		// Form elements should be read-only when corresponding commands are disabled.
		form.displayTextInputView.bind('isReadOnly').to(command, 'isEnabled', value => !value);
	}
}

/**
 * Provide validators for the plugin form.
 */
function getFormValidators(t) {
	return [
		form => {
			if (!form.displayText.length) {
				return t('The display text must not be empty.');
			}
		},
		form => {
			if (!form.tweetableTextVal.length) {
				return t('The tweetable text must not be empty.');
			}
		}
	];
}
