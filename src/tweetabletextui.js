import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown } from '@ckeditor/ckeditor5/src/ui';

import TweetableTextFormView from './ui/tweetablttextformview';
import tweetableTextIcon from '../theme/icons/tweetableText.svg';


export default class TweetableTextUI extends Plugin {

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'TweetableTextUI';
  }

  init() {
    const editor = this.editor;
    const command = editor.commands.get('tweetableText');

    editor.ui.componentFactory.add('tweetableText', locale => {
      const view = new ButtonView(locale);

      view.set({
        label: 'Insert image',
        icon: imageIcon,
        tooltip: true
      });

      // Callback executed once the image is clicked.
      view.on('execute', () => {
        const imageUrl = prompt('Image URL');

        editor.model.change(writer => {
          const imageElement = writer.createElement('imageBlock', {
            src: imageUrl
          });

          const linkText = 'Gaurav';
          const linkUrl = 'https://twitter.com/test';

          const insertPosition = editor.model.document.selection.getFirstPosition();
          writer.insertText(linkText, { linkHref: linkUrl }, insertPosition);
        });
      });

      return view;
    });
  }
}
