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

export default class TweetableTextFormView extends View {
  constructor(validators, locale) {
    super(locale);

    const t = locale.t;

    this.focusTracker = new FocusTracker();
    this.keystrokes = new KeystrokeHandler();
    this.set('displayTextInputValue', '');
    this.set('tweetableTextValInputValue', '');

    this.displayTextInputView = this._createDisplayTextInput();
    this.tweetableTextValInputView = this._createTweetableTextValInput();

    this.saveButtonView = this._createButton(t('Insert'), icons.check, 'ck-button-save');
    this.saveButtonView.type = 'submit';
    // this.saveButtonView.bind('isEnabled').to(this, 'displayTextInputValue', value => !!value);

    this.cancelButtonView = this._createButton(t('Cancel'), icons.cancel, 'ck-button-cancel', 'cancel');

    this._focusables = new ViewCollection();

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

    // Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
    // keystroke handler would take over the key management in the URL input. We need to prevent
    // this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
    this.keystrokes.set('arrowright', stopPropagation);
    this.keystrokes.set('arrowleft', stopPropagation);
    this.keystrokes.set('arrowup', stopPropagation);
    this.keystrokes.set('arrowdown', stopPropagation);

    // Intercept the `selectstart` event, which is blocked by default because of the default behavior
    // of the DropdownView#panelView.
    // TODO: blocking `selectstart` in the #panelView should be configurable per–drop–down instance.
    // this.listenTo(this.urlInputView.element, 'selectstart', (evt, domEvt) => {
    //   domEvt.stopPropagation();
    // }, { priority: 'high' });
  }

  /**
   * @inheritDoc
   */
  destroy() {
    super.destroy();

    this.focusTracker.destroy();
    this.keystrokes.destroy();
  }

  focus() {
    this._focusCycler.focusFirst();
  }

  get displayText() {
    return this.displayTextInputView.fieldView.element.value.trim();
  }

  set displayText(displayText) {
    this.displayTextInputView.fieldView.element.value = displayText.trim();
  }

  get tweetableTextVal() {
    return this.tweetableTextValInputView.fieldView.element.value.trim();
  }

  set tweetableTextVal(tweetableTextVal) {
    this.tweetableTextValInputView.fieldView.element.value = tweetableTextVal.trim();
  }

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

  resetFormStatus() {
    this.displayTextInputView.errorText = null;
    this.displayTextInputView.infoText = this._displayTextInputViewInfoDefault;

    this.tweetableTextValInputView.errorText = null;
    this.tweetableTextValInputView.infoText = this._tweetableTextValInputViewInfoDefault;
  }

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
