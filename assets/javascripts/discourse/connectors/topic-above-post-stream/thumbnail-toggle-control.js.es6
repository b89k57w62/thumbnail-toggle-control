import { ajax } from "discourse/lib/ajax";

export default {
  setupComponent(attrs, component) {
    // 初始化檢查
    if (!attrs.context || !attrs.context.model) return;
  },
  
  actions: {
    toggleThumbnail() {
      const topic = this.get("context.model");
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