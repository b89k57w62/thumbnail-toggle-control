import { withPluginApi } from "discourse/lib/plugin-api";
import { MessageBus } from "discourse/lib/message-bus";


export default {
  name: "thumbnail-toggle-initializer",
  initialize(container) {
    withPluginApi("1.4.0", api => {
      // 註冊 MessageBus 監聽
      MessageBus.subscribe("/thumbnail-toggle/ready", () => {
        console.log("Thumbnail Toggle 插件已準備好");
      });
      
      // 自定義事件處理
      api.modifyClass("component:topic-list-item", {
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
        actions: {
          toggleThumbnail() {
            const topic = this.model.topic || this.model;
            if (!topic) return;
            
            const currentValue = topic.get("tlp_show_thumbnail");
            const newValue = !currentValue;
            
            // 顯示即時反饋
            topic.set("tlp_show_thumbnail", newValue);
            
            // 發送請求到伺服器
            this.store.update("topic", {
              id: topic.id,
              tlp_show_thumbnail: newValue
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