import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { Widget } from '@ckeditor/ckeditor5/src/widget';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import TweetableTextUI from './tweetabletextui';

export default class TweetableText extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [TweetableTextUI, Widget];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'TweetableText';
  }
}
