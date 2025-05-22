import { ajax } from "discourse/lib/ajax";

export default {
  // 決定是否顯示縮圖
  shouldShowThumbnail(topic, siteSettings) {
    // 如果全局功能關閉，直接返回true（總是顯示）
    if (!siteSettings.thumbnail_toggle_enabled) {
      return true;
    }
    
    // 檢查主題是否有自定義字段設置
    if (topic.custom_fields && topic.custom_fields.tlp_show_thumbnail !== undefined) {
      return topic.custom_fields.tlp_show_thumbnail;
    }
    
    // 檢查是否啟用了分類覆蓋
    if (siteSettings.thumbnail_toggle_category_override && topic.category) {
      const category = topic.category;
      
      // 如果分類未啟用縮圖切換，則使用全局默認值
      if (!category.custom_fields || !category.custom_fields.thumbnail_toggle_enabled) {
        return siteSettings.thumbnail_toggle_default;
      }
      
      // 使用分類的默認設置
      return category.custom_fields.thumbnail_toggle_default;
    }
    
    // 如果沒有特定設置，使用全局默認值
    return siteSettings.thumbnail_toggle_default;
  },
  
  // 切換主題的縮圖顯示狀態
  toggleThumbnail(topic) {
    if (!topic) return;
    
    const topicId = topic.id;
    const currentValue = topic.custom_fields && topic.custom_fields.tlp_show_thumbnail !== undefined ? 
      topic.custom_fields.tlp_show_thumbnail : 
      false;
    
    const newValue = !currentValue;
    
    // 更新本地狀態以提供即時反饋
    topic.set("custom_fields.tlp_show_thumbnail", newValue);
    
    // 發送 AJAX 請求
    return ajax(`/t/${topicId}`, {
      type: "PUT",
      data: { 
        tlp_show_thumbnail: newValue 
      }
    }).catch(error => {
      // 如果失敗，回滾狀態
      topic.set("custom_fields.tlp_show_thumbnail", currentValue);
      throw error;
    });
  }
}; 