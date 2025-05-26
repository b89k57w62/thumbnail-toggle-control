import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";


export default {
  name: "thumbnail-toggle-initializer",
  initialize(container) {
    withPluginApi("1.4.0", api => {
      
      // 自定義事件處理
      api.modifyClass("component:topic-list-item", {
        pluginId: "discourse-thumbnail-toggle",
        didInsertElement() {
          this._super(...arguments);
          
          // 確保我們有主題資料
          const topic = this.get("topic");
          if (!topic) return;
          
          // 在主題上添加 tlp_show_thumbnail 觀察器
          // 當值變化時強制重新渲染
          if (!topic._tlpObserverAdded) {
            topic.addObserver("tlp_show_thumbnail", () => {
              this.queueRerender();
            });
            topic._tlpObserverAdded = true;
          }
        }
      });
      
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