/**
 * UI for a Image Message
 *
 * ### Importing
 *
 * Included with the standard build. For custom build, import with:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/image/layer-image-message-view';
 * ```
 *
 * @class Layer.UI.messages.ImageMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.Component
 */
import { registerComponent } from '../../components/component';
import Constants from '../../constants';
import MessageViewMixin from '../message-view-mixin';
import './layer-image-message-model';
import ImageManager from 'blueimp-load-image/js/load-image';
import 'blueimp-load-image/js/load-image-orientation';
import 'blueimp-load-image/js/load-image-meta';
import 'blueimp-load-image/js/load-image-exif';

registerComponent('layer-image-message-view', {
  mixins: [MessageViewMixin],
  style: `layer-image-message-view {
      display: block;
      overflow: hidden;
      width: 100%;
    }
    layer-image-message-view img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    layer-message-viewer.layer-image-message-view > * {
      cursor: pointer;
    }
 `,
  template: '<img layer-id="image" />',
  properties: {

    // See parent class; uses an any-width style width if there is no metadata.
    widthType: {
      get() {
        return this.parentComponent.isShowingMetadata ? Constants.WIDTH.FLEX : Constants.WIDTH.ANY;
      },
    },

    /**
     * Fix the image height if image is sent as an image with metadata displaying below it.
     *
     * This can be changed, but needs to be changed at intiialization time, not runtime.
     *
     * @property {Number} [heightWithMetadata=250]
     */
    heightWithMetadata: {
      value: 250,
    },

    /**
     * If showing only the image, and no metadata below it, use a maximum height of 400px.
     *
     * @property {Number} [maxHeightWithoutMetadata=400]
     */
    maxHeightWithoutMetadata: {
      value: 400,
    },

    maxWidth: {
      value: 450,
    },

    /**
     * Use a Standard Display Container to render this UI.
     *
     * @property {String} [messageViewContainerTagName=layer-standard-message-view-container]
     */
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-message-view-container',
    },
  },
  methods: {
    onCreate() {
      this.nodes.image.addEventListener('load', evt => this._imageLoaded(evt.target));
    },

    // See parent component for definition
    onAfterCreate() {
      // Image Message heights aren't known until the metadata has been parsed; default to false.
      if (this.model.part.body) {
        this._initializeHeight();
      } else {
        this.model.once('message-type-model:change', () => {
          this._initializeHeight();
          this.onRender();
        });
      }
    },

    _initializeHeight() {
      this.properties.sizes = this._getBestDimensions({});
      if (this.properties.sizes.height) {
        this.height = this.properties.sizes.height;
      } else {
        this.isHeightAllocated = false;
      }
    },

    // TODO: Allow this to be recalculated using the available width on the screen. For now this simplifies things greatly.
    _getBestDimensions({ height = this.model.height, width = this.model.width }) {

      let ratio;
      let newWidth;
      let newHeight;

      if (width && height) {
        ratio = width / height;
      } else if (this.model.previewWidth && this.model.previewHeight) {
        ratio = this.model.previewWidth / this.model.previewHeight;
      }

      if (this.parentComponent.isShowingMetadata) {
        newHeight = this.heightWithMetadata;
        if (ratio) newWidth = newHeight * ratio;
      } else if (this.model.previewHeight) {
        newHeight = Math.min(this.maxHeightWithoutMetadata, this.model.previewHeight);
        width = newHeight * ratio;
      }

      if (newWidth && newWidth > this.maxWidth) {
        newWidth = this.maxWidth;
        newHeight = newWidth / ratio;
      }

      return { width: newWidth, height: newHeight };
    },

    // See parent component for definition
    onAttach: {
      mode: registerComponent.MODES.AFTER,
      value() {
        // Any time the widget is re-added to the DOM, update its dimensions and rerender
        this.onRerender();
      },
    },

    /**
     * Every time the model changes, or after initialization, rerender the image.
     *
     * TODO: Currently uses an img tag for sourceUrl/previewUrl and a canvas for
     * source/preview. This should consistently use a canvas.
     *
     * @method onRerender
     */
    onRender() {
      // wait until the parentComponent is a Message Display Container
      //if (!this.properties._internalState.onAttachCalled) return;

      // Get the blob and render as a canvas
      if (this.model.source || this.model.preview) {
        this.model.getPreviewBlob(blob => this._renderCanvas(blob));
      } else {

        // Else get the imageUrl/previewUrl and stick it in the image src property.
        const img = this.nodes.image;
        img.src = this.model.previewUrl || this.model.sourceUrl;
        if (this.properties.sizes) {
          if (this.properties.sizes.height) {
            this.height = this.properties.sizes.height;
          } else {
            img.style.display = 'none';
          }
          if (this.properties.sizes.width) img.style.width = this.properties.sizes.width + 'px';
        }
      }
    },

    onRerender() {
      if (this.nodes.image.naturalWidth && this.model.part.body && this.parentComponent.isShowingMetadata) {
        // 10 margin for error in case custom stylesheets add margins borders and padding to skew results
        if (this.nodes.image.naturalWidth + 10 < this.parentComponent.clientWidth) {
          this.nodes.image.style.width = 'inherit';
        }
      }
    },

    /**
     * Called when the image has finished loading via `sourceUrl` or `previewUrl`.
     *
     * Set the `isHeightAllocated` property to `true` as its height is now fixed and known.
     *
     * Set the width if the width is too great.
     *
     * @param {HTMLElement} img
     */
    _imageLoaded() {
      const img = this.nodes.image;
      if (!this.properties.sizes.height) {
        this.properties.sizes = this._getBestDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        if (this.properties.sizes.height) {
          this.height = this.properties.sizes.height;
          img.style.display = '';
          this.isHeightAllocated = true;
        }
      }

      const minWidth = this.parentComponent.getPreferredMinWidth();
      const width = this.properties.sizes.width;
      // maxWidth has already been used to constrain img.width and can be ignored for this calculation
      if (width > minWidth) this.messageViewer.style.width = (width + 2) + 'px';
      this.onRerender();
    },

    /**
     * Lookup the maximum allowed width for this Image.
     *
     * If its NOT a Root Model, then its width should fill all available space in the parent.
     *
     * If it IS a Root Model, then we execute upon rules that use 60% of available width or 80% of width
     * based on the total available width.
     *
     * Note that even if there is a large amount of available width, there is still a maximum allowed height
     * that may prevent us from using the full width.
     *
     * method _getMaxMessageWidth
     * @private
     * @removed
     */
    /*_getMaxMessageWidth() {
      if (this.messageViewer.classList.contains('layer-root-viewer')) {
        const parent = this.messageViewer.parentNode;
        if (!parent || !parent.clientWidth) return 0;

        // Enforcing the 60%/80% rules is pretty arbitrary; alternate calculations should be looked at;
        // Location View may have implemented improvements on this
        let width = parent.clientWidth;
        if (width > 600) width = width * 0.6;
        else width = width * 0.8;
        return width;
      } else {
        return this.messageViewer.parentNode.clientWidth;
      }
    },*/


    /**
     * Generate a Canvas to render our image.
     *
     * Rendering Rules:
     *
     * * Images whose height is less than width and width is less than 192px are scaled to 192px
     * * Images whose height is greater than width and width is less than 192px are scaled to height 192px?
     * * Images whose width and height are equal, and less than 192px should be scaled up to 192px
     * * Images between 192-350 are sized as-is
     * * However, if there is metadata, scale images up to 350px
     *
     * @method _renderCanvas
     * @private
     * @param {Blob} blob
     */
    _renderCanvas(blob) {

      // Read the EXIF data
      ImageManager.parseMetaData(
        blob, (data) => {
          const options = {
            canvas: true,
            orientation: this.model.orientation,
          };

          if (data.imageHead && data.exif) {
            options.orientation = data.exif.get('Orientation') || 1;
          }
          options.maxWidth = this.maxWidth;
          options.maxHeight = this.properties.sizes.height || this.maxHeightWithoutMetadata;

          // Write the image to a canvas with the specified orientation
          ImageManager(blob, (canvas) => {
            if (canvas instanceof HTMLElement) {
            /*  if (width < minWidth && height < minHeight) {
                if (width > height) {
                  canvas = ImageManager.scale(canvas, { minWidth });
                } else {
                  canvas = ImageManager.scale(canvas, { minHeight });
                }
              }
*/

              this.nodes.image.src = canvas.toDataURL();
              //if (canvas.width >= this.minWidth) this.parentComponent.style.width = canvas.width + 'px';
              this.isHeightAllocated = true;
            } else {
              console.error(canvas);
            }
          }, options);
        },
      );
    },
  },
});
