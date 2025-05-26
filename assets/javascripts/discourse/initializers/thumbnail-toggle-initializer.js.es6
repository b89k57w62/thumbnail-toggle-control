import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";


export default {
  name: "thumbnail-toggle-initializer",
  initialize(container) {
    // 添加全局函數供 raw template 使用
    window.toggleThumbnail = function(topicId) {
      console.log("切換縮圖狀態，主題ID:", topicId);
      
      // 先獲取當前狀態
      const button = document.querySelector(`button[onclick="toggleThumbnail(${topicId})"]`);
      const icon = button ? button.querySelector('.d-icon') : null;
      const isCurrentlyShown = icon ? !icon.classList.contains('d-icon-image-slash') : true;
      const newValue = !isCurrentlyShown;
      
      console.log("當前狀態:", isCurrentlyShown, "新狀態:", newValue);
      
      // 使用 ajax 發送請求到伺服器
      ajax(`/t/${topicId}`, {
        type: "PUT",
        data: { 
          tlp_show_thumbnail: newValue
        }
      }).then(() => {
        console.log("縮圖狀態更新成功");
        // 重新載入頁面以反映變化
        window.location.reload();
      }).catch(error => {
        console.error("無法更新縮圖狀態", error);
      });
    };
    
    withPluginApi("1.4.0", api => {
      
      // 移除 topic-list-item 修改，改用其他方式處理重新渲染
      
      // 在主題頁面也添加處理
              api.modifyClass("controller:topic", {
          pluginId: "thumbnail-toggle-control",
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