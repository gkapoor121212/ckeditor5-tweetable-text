/**
 * @module tweetable-text
 */

import {
	ButtonView,
	FocusCycler,
	LabeledFieldView,
	View,
	ViewCollection,
	createLabeledInputText,
	injectCssTransitionDisabler,
	submitHandler
} from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';
import { icons } from 'ckeditor5/src/core';

import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';

/**
 * The tweetable text form view controller class.
 *
 * See {@link module:tweetable-text/ui/tweetabletextformview~TweetableTextFormView}.
 *
 * @extends module:ui/view~View
 */
export default class TweetableTextFormView extends View {
	/**
	 * @param {Array.<Function>} validators Form validators used by {@link #isValid}.
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 */
	constructor(validators, locale) {
		super(locale);

		const t = locale.t;

		/**
		 * Tracks information about the DOM focus in the form.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * The value of the Display text input.
		 *
		 * @member {String} #displayTextInputValue
		 * @observable
		 */
		this.set('displayTextInputValue', '');

		/**
		 * The value of the Tweetable text input.
		 *
		 * @member {String} #tweetableTextInputValue
		 * @observable
		 */
		this.set('tweetableTextValInputValue', '');

		/**
		 * The display text input view.
		 *
		 * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
		 */
		this.displayTextInputView = this._createDisplayTextInput();

		/**
		 * The tweetable text input view.
		 *
		 * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
		 */
		this.tweetableTextValInputView = this._createTweetableTextValInput();

		/**
		 * The Save button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.saveButtonView = this._createButton(t('Insert'), icons.check, 'ck-button-save');
		this.saveButtonView.type = 'submit';

		/**
		 * The Cancel button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.cancelButtonView = this._createButton(t('Cancel'), icons.cancel, 'ck-button-cancel', 'cancel');

		/**
		 * A collection of views that can be focused in the form.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this._focusables = new ViewCollection();

		/**
		 * Helps cycling over {@link #_focusables} in the form.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this._focusCycler = new FocusCycler({
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the <kbd>Tab</kbd> key.
				focusNext: 'tab'
			}
		});

		/**
		 * An array of form validators used by {@link #isValid}.
		 *
		 * @readonly
		 * @protected
		 * @member {Array.<Function>}
		 */
		this._validators = validators;

		this.setTemplate({
			tag: 'form',

			attributes: {
				class: [
					'ck',
					'ck-responsive-form'
				],

				tabindex: '-1'
			},

			children: [
				this.displayTextInputView,
				this.tweetableTextValInputView,
				this.saveButtonView,
				this.cancelButtonView
			]
		});
		injectCssTransitionDisabler(this);

	}

	/**
    * @inheritDoc
    */
	render() {
		super.render();

		submitHandler({
			view: this
		});

		const childViews = [
			this.displayTextInputView,
			this.tweetableTextValInputView,
			this.saveButtonView,
			this.cancelButtonView
		];

		childViews.forEach(v => {
			// Register the view as focusable.
			this._focusables.add(v);

			// Register the view in the focus tracker.
			this.focusTracker.add(v.element);
		});

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo(this.element);

		const stopPropagation = data => data.stopPropagation();

		this.keystrokes.set('arrowright', stopPropagation);
		this.keystrokes.set('arrowleft', stopPropagation);
		this.keystrokes.set('arrowup', stopPropagation);
		this.keystrokes.set('arrowdown', stopPropagation);

	}

	/**
    * @inheritDoc
    */
	destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Focuses the fist {@link #_focusables} in the form.
	 */
	focus() {
		this._focusCycler.focusFirst();
	}

	/**
	 * The native DOM `value` of the {@link #displayTextInputView} element.
	 *
	 * @type {String}
	 */
	get displayText() {
		return this.displayTextInputView.fieldView.element.value.trim();
	}

	set displayText(displayText) {
		this.displayTextInputView.fieldView.element.value = displayText.trim();
	}

	/**
	 * The native DOM `value` of the {@link #tweetableTextValInputView} element.
	 *
	 * @type {String}
	 */
	get tweetableTextVal() {
		return this.tweetableTextValInputView.fieldView.element.value.trim();
	}

	set tweetableTextVal(tweetableTextVal) {
		this.tweetableTextValInputView.fieldView.element.value = tweetableTextVal.trim();
	}

	/**
	 * Validates the form and returns `false` when some fields are invalid.
	 *
	 * @returns {Boolean}
	 */
	isValid() {
		this.resetFormStatus();

		for (const validator of this._validators) {
			const errorText = validator(this);

			// One error per field is enough.
			if (errorText) {
				// Apply updated error.
				this.displayTextInputView.errorText = errorText;

				return false;
			}
		}

		return true;
	}

	/**
	 * Cleans up the supplementary error and information text of the {@link #displayTextInputView}
	 * and {@link #tweetableTextValInputView} bringing them back to the state when the form has
	 * been displayed for the first time.
	 *
	 * See {@link #isValid}.
	 */
	resetFormStatus() {
		this.displayTextInputView.errorText = null;
		this.displayTextInputView.infoText = this._displayTextInputViewInfoDefault;

		this.tweetableTextValInputView.errorText = null;
		this.tweetableTextValInputView.infoText = this._tweetableTextValInputViewInfoDefault;
	}

	/**
	 * Creates a labeled input view.
	 *
	 * @private
	 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView} Labeled input view instance.
	 */
	_createDisplayTextInput() {
		const t = this.locale.t;

		const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
		const inputField = labeledInput.fieldView;

		this._displayTextInputViewInfoDefault = t('Add display text.');
		this._displayTextInputViewInfoTip = t('Tip: this text will be shown to user as it is.');

		labeledInput.label = t('Display Text');
		labeledInput.infoText = this._displayTextInputViewInfoDefault;

		inputField.on('input', () => {
			// Display the tip text only when there is some value. Otherwise fall back to the default info text.
			labeledInput.infoText = inputField.element.value ? this._displayTextInputViewInfoTip : this._displayTextInputViewInfoDefault;
			this.displayTextInputValue = inputField.element.value.trim();
		});

		return labeledInput;
	}

	/**
	 * Creates a labeled input view.
	 *
	 * @private
	 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView} Labeled input view instance.
	 */
	_createTweetableTextValInput() {
		const t = this.locale.t;

		const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
		const inputField = labeledInput.fieldView;

		this._tweetableTextValInputViewInfoDefault = t('Add tweetable text.');
		this._tweetableTextValInputViewInfoTip = t('Tip: this text will be tweeted.');

		labeledInput.label = t('Tweetable Text');
		labeledInput.infoText = this._tweetableTextValInputViewInfoDefault;

		inputField.on('input', () => {
			// Display the tip text only when there is some value. Otherwise fall back to the default info text.
			labeledInput.infoText = inputField.element.value ? this._tweetableTextValInputViewInfoTip : this._tweetableTextValInputViewInfoDefault;
			this.tweetableTextValInputValue = inputField.element.value.trim();
		});

		return labeledInput;
	}

	/**
	 * Creates a button view.
	 *
	 * @private
	 * @param {String} label The button label.
	 * @param {String} icon The button icon.
	 * @param {String} className The additional button CSS class name.
	 * @param {String} [eventName] An event name that the `ButtonView#execute` event will be delegated to.
	 * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
	 */
	_createButton(label, icon, className, eventName) {
		const button = new ButtonView(this.locale);

		button.set({
			label,
			icon,
			tooltip: true
		});

		button.extendTemplate({
			attributes: {
				class: className
			}
		});

		if (eventName) {
			button.delegate('execute').to(this, eventName);
		}

		return button;
	}
}
