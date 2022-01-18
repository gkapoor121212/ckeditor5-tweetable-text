import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { createDropdown } from '@ckeditor/ckeditor5/src/ui';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';

import TweetableTextFormView from './ui/tweetablttextformview';
import tweetableTextIcon from '../theme/icons/tweetableText.svg';


export default class TweetableTextUI extends Plugin {
  init() {
    const editor = this.editor;

    editor.ui.componentFactory.add('tweetableText', locale => {
      const dropdownView = createDropdown(locale);

      const tweetableTextForm = new TweetableTextFormView(getFormValidators(editor.t), editor.locale);
      const command = editor.commands.get('tweetableText');

      this._setUpDropdown(dropdownView, tweetableTextForm, command, editor);

      return dropdownView;
    });
  }

  _setUpDropdown(dropdown, form, command) {
    const editor = this.editor;
    const t = editor.t;
    const button = dropdown.buttonView;

    dropdown.bind('isEnabled').to(command);
    dropdown.panelView.children.add(form);

    button.set({
      label: 'Tweetable Text',
      icon: tweetableTextIcon,
      tooltip: true
    });
  }
}

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
