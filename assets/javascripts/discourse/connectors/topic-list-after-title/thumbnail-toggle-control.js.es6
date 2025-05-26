import { ajax } from "discourse/lib/ajax";

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
      
      const currentValue = topic.get("tlp_show_thumbnail");
      const newValue = !currentValue;
      
      // 顯示即時反饋
      topic.set("tlp_show_thumbnail", newValue);
      
      // 使用 ajax 發送請求到伺服器
      ajax(`/t/${topic.id}`, {
        type: "PUT",
        data: { 
          tlp_show_thumbnail: newValue 
        }
      }).catch(error => {
        // 如果失敗，回滾操作
        topic.set("tlp_show_thumbnail", currentValue);
        console.error("無法更新縮圖狀態", error);
      });
    }
  }
}; 