/**
 * This widget renders any message received by this user within the Message List.
 *
 * ### Importing
 *
 * Included with the standard build. If creating a custom build, import:
 *
 * ```
 * import '@layerhq/web-xdk/lib/ui/components/layer-message-list/layer-message-item-received';
 * ```
 *
 * @class Layer.UI.components.MessageListPanel.ReceivedItem
 * @extends Layer.UI.Component
 * @mixin Layer.UI.components.MessageListPanel.Item
 */
import { registerComponent } from '../component';
import MessageItemMixin from './layer-message-item-mixin';

registerComponent('layer-message-item-received', {
  mixins: [MessageItemMixin],
  template: `
    <div class='layer-list-item' layer-id='innerNode'>

      <!-- Header -->
      <layer-replaceable-content class='layer-message-header' name='messageRowHeader'></layer-replaceable-content>

      <!-- Body -->
      <div class='layer-message-row' layer-id='messageRow'>

        <!-- Body: Left Side -->
        <layer-replaceable-content class='layer-message-left-side' name='messageRowLeftSide'></layer-replaceable-content>

        <!-- Body: Message Contents -->
        <div class='layer-message-item-main'>
          <layer-message-viewer layer-id='messageViewer'></layer-message-viewer>
          <div class='layer-message-item-content' layer-id='content'></div>
        </div>

        <!-- Body: Right Side -->
        <layer-replaceable-content class='layer-message-right-side' name='messageRowRightSide'></layer-replaceable-content>
      </div>

      <!-- Footer -->
      <layer-replaceable-content class='layer-message-footer' name='messageRowFooter'></layer-replaceable-content>
    </div>
  `,
  style: `
    layer-message-item-received {
      display: flex;
      flex-direction: column;
      align-content: stretch;
    }

    layer-message-item-received .layer-list-item {
      display: flex;
      flex-direction: column;
      align-content: stretch;
    }

    layer-message-item-received .layer-message-row {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
    }

    layer-message-item-received  .layer-message-item-main {
      flex-grow: 1;
      overflow: hidden;
    }

    /* Insure that text, images, videos, etc... are all left aligned */
    layer-message-item-received layer-message-text-plain {
      display: block;
    }
  `,
});