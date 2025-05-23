import { ajax } from "discourse/lib/ajax";
import ThumbnailToggleHelper from "../../lib/thumbnail-toggle-helper";

export default {
  setupComponent(attrs, component) {
    // 確保有 context.topic
    if (!attrs.context || !attrs.context.topic) return;
  },
  
  actions: {
    toggleThumbnail() {
      // 獲取主題對象
      const topic = this.get("context.topic");
      if (!topic) return;
      
      // 使用幫助類來處理邏輯
      ThumbnailToggleHelper.toggleThumbnail(topic);
    }
  }
}; 