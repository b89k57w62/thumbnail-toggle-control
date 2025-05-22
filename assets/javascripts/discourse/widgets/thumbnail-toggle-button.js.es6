import { createWidget } from "discourse/widgets/widget";
import { h } from "virtual-dom";
import ThumbnailToggleHelper from "../lib/thumbnail-toggle-helper";

export default createWidget("thumbnail-toggle-button", {
  tagName: "button.btn-icon.toggle-thumbnail-btn",
  
  buildAttributes(attrs) {
    return {
      title: I18n.t(attrs.showThumbnail ? "thumbnail_toggle.hide" : "thumbnail_toggle.show")
    };
  },
  
  html(attrs) {
    return h("i.fa", {
      className: attrs.showThumbnail ? "fa-image-slash" : "fa-image"
    });
  },
  
  click() {
    const topic = this.attrs.topic;
    if (!topic) return;
    
    ThumbnailToggleHelper.toggleThumbnail(topic);
    
    // 立即更新顯示狀態
    this.scheduleRerender();
  }
}); 