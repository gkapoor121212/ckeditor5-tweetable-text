import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TweetableTextEditing from './tweetabletextediting';
import TweetableTextUI from './tweetabletextui';

export default class TweetableText extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [TweetableTextEditing, TweetableTextUI];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'TweetableText';
  }
}
