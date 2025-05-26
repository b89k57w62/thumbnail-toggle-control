import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";


export default {
  name: "thumbnail-toggle-initializer",
  initialize(container) {
    withPluginApi("1.4.0", api => {
      
      // 移除 topic-list-item 修改，改用其他方式處理重新渲染
      
      // 在主題頁面也添加處理
      api.modifyClass("controller:topic", {
        pluginId: "discourse-thumbnail-toggle",
        actions: {
          toggleThumbnail() {
            const topic = this.model.topic || this.model;
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
      });
    });
  }
}; 