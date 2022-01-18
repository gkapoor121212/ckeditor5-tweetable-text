// placeholder/placeholderediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TweetableTextCommand from './tweetabletextcommand';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

export default class PlaceholderEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add('tweetableText', new PlaceholderCommand(this.editor));
    this.editor.editing.mapper.on(
      'viewToModelPosition',
      viewToModelPositionOutsideModelElement(this.editor.model, viewElement => viewElement.hasClass('tweetableText'))
    );
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register('tweetableText', {
      // Allow wherever text is allowed:
      allowWhere: '$text',

      // The placeholder will act as an inline node:
      isInline: true,

      // The inline widget is self-contained so it cannot be split by the caret and can be selected:
      isObject: true,

      // The inline widget can have the same attributes as text (for example linkHref, bold).
      allowAttributesOf: '$text',

      // The placeholder can have many types, like date, name, surname, etc:
      allowAttributes: ['displayText', 'tweetableTextVal']
    });
  }

  _defineConverters() {                                                      // ADDED
    const conversion = this.editor.conversion;

    conversion.for('upcast').elementToElement({
      view: {
        name: 'span',
        classes: ['tweetableText']
      },
      model: (viewElement, { writer: modelWriter }) => {
        // Extract the "name" from "{name}".
        const displayText = viewElement.getChild(0).data.slice(1, -1);
        const tweetableTextVal = viewElement.getChild(0).data.slice(1, -1);

        return modelWriter.createElement('tweetableText', { displayText, tweetableTextVal });
      }
    });

    conversion.for('editingDowncast').elementToElement({
      model: 'tweetableText',
      view: (modelItem, { writer: viewWriter }) => {
        const widgetElement = createPlaceholderView(modelItem, viewWriter);

        // Enable widget handling on a placeholder element inside the editing view.
        return toWidget(widgetElement, viewWriter);
      }
    });

    conversion.for('dataDowncast').elementToElement({
      model: 'tweetableText',
      view: (modelItem, { writer: viewWriter }) => createPlaceholderView(modelItem, viewWriter)
    });

    // Helper method for both downcast converters.
    function createPlaceholderView(modelItem, viewWriter) {
      const displayText = modelItem.getAttribute('displayText');
      const tweetableTextVal = modelItem.getAttribute('tweetableTextVal');

      const placeholderView = viewWriter.createContainerElement('span', {
        class: 'tweetableText'
      }, {
        isAllowedInsideAttributeElement: true
      });

      // Insert the placeholder name (as a text).
      const innerText = viewWriter.createText('{' + displayText + tweetableTextVal + '}');
      viewWriter.insert(viewWriter.createPositionAt(placeholderView, 0), innerText);

      // const linkText = 'Gaurav';
      // const linkUrl = 'https://twitter.com/test';

      // const insertPosition = editor.model.document.selection.getFirstPosition();
      // writer.insertText(linkText, { linkHref: linkUrl }, insertPosition);

      return placeholderView;
    }
  }
}
