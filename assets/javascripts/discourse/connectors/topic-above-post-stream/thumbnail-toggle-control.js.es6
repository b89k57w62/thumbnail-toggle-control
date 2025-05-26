import { ajax } from "discourse/lib/ajax";

export default {
  setupComponent(attrs, component) {
    // 初始化檢查
    if (!attrs.context || !attrs.context.model) return;
    
    // 將 topic 存儲在組件上以便訪問
    component.set("topic", attrs.context.model);
    
    // 綁定 action 到組件
    component.set("actions", {
      toggleThumbnail: this.toggleThumbnail.bind(component)
    });
  },
  
  toggleThumbnail() {
    const topic = this.get("topic");
    if (!topic) {
      console.error("無法找到主題對象");
      return;
    }
    
    console.log("切換縮圖狀態，主題ID:", topic.id);
    
    const currentValue = topic.get("tlp_show_thumbnail");
    const newValue = !currentValue;
    
    console.log("當前值:", currentValue, "新值:", newValue);
    
    // 顯示即時反饋
    topic.set("tlp_show_thumbnail", newValue);
    
    // 使用 ajax 發送請求到伺服器
    ajax(`/t/${topic.id}`, {
      type: "PUT",
      data: { 
        tlp_show_thumbnail: newValue 
      }
    }).then(() => {
      console.log("縮圖狀態更新成功");
      // 觸發重新渲染
      topic.notifyPropertyChange("tlp_show_thumbnail");
    }).catch(error => {
      // 如果失敗，回滾操作
      topic.set("tlp_show_thumbnail", currentValue);
      console.error("無法更新縮圖狀態", error);
    });
  }
}; 