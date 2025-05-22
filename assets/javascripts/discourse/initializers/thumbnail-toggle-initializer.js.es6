import { withPluginApi } from "discourse/lib/plugin-api";
import ThumbnailToggleHelper from "../lib/thumbnail-toggle-helper";

export default {
  name: "thumbnail-toggle-initializer",
  initialize() {
    withPluginApi("1.4.0", api => {
      // 1. 處理主題列表中的縮圖顯示
      api.decorateWidget("topic-list-item:after", helper => {
        const topic = helper.attrs.topic;
        if (!topic || !topic.thumbnail_url) return;
        
        // 判斷是否應該顯示縮圖切換按鈕
        const siteSettings = helper.widget.siteSettings;
        if (!siteSettings.thumbnail_toggle_enabled) return;
        
        // 創建縮圖切換按鈕
        return helper.attach("thumbnail-toggle-button", {
          topic,
          showThumbnail: ThumbnailToggleHelper.shouldShowThumbnail(topic, siteSettings)
        });
      });
      
      // 2. 處理主題頁面中的縮圖顯示
      api.decorateWidget("topic-title:after", helper => {
        const topic = helper.getModel();
        if (!topic || !topic.thumbnail_url) return;
        
        // 判斷是否應該顯示縮圖切換按鈕
        const siteSettings = helper.widget.siteSettings;
        if (!siteSettings.thumbnail_toggle_enabled) return;
        
        // 創建縮圖切換按鈕
        return helper.attach("thumbnail-toggle-button", {
          topic,
          showThumbnail: ThumbnailToggleHelper.shouldShowThumbnail(topic, siteSettings)
        });
      });
      
      // 3. Patch TLP 的 Serializer
      api.modifyClass("controller:topic", {
        actions: {
          toggleThumbnail() {
            const model = this.model;
            if (!model) return;
            ThumbnailToggleHelper.toggleThumbnail(model);
          }
        }
      });
    });
  }
}; 