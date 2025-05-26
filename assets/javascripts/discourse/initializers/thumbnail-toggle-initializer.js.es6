import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";

export default {
  name: "thumbnail-toggle-initializer",
  
  initialize() {
    withPluginApi("0.8.31", api => {
      console.log("Thumbnail Toggle Initializer: 插件 API 已初始化");
      
      // 全局函數供 raw template 使用
      window.toggleThumbnail = function(topicId) {
        console.log("toggleThumbnail 被調用，主題ID:", topicId);
        
        // 查找按鈕元素來確定當前狀態
        const button = document.querySelector(`[data-topic-id="${topicId}"] .toggle-thumbnail-btn`);
        if (!button) {
          console.error("找不到按鈕元素");
          return;
        }
        
        // 通過圖標判斷當前狀態
        const icon = button.querySelector('.d-icon');
        const isCurrentlyShowing = icon && icon.classList.contains('d-icon-far-image');
        const newValue = !isCurrentlyShowing;
        
        console.log("當前顯示狀態:", isCurrentlyShowing, "新狀態:", newValue);
        
        // 立即更新按鈕狀態以提供即時反饋
        if (icon) {
          icon.className = newValue ? 'd-icon d-icon-far-image' : 'd-icon d-icon-far-image-slash';
        }
        
        // 發送 AJAX 請求
        ajax(`/t/${topicId}`, {
          type: "PUT",
          data: { 
            tlp_show_thumbnail: newValue 
          }
        }).then(() => {
          console.log("縮圖狀態更新成功");
          // 強制重新載入頁面以確保更改生效
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }).catch(error => {
          console.error("無法更新縮圖狀態", error);
          // 如果失敗，回滾按鈕狀態
          if (icon) {
            icon.className = isCurrentlyShowing ? 'd-icon d-icon-far-image' : 'd-icon d-icon-far-image-slash';
          }
        });
      };
      
      // 監聽 topic list 更新事件
      api.onPageChange((url, title) => {
        console.log("頁面變更:", url, title);
        
        // 檢查是否有縮圖數據
        setTimeout(() => {
          const topics = document.querySelectorAll('.topic-list-item');
          topics.forEach(topic => {
            const topicId = topic.dataset.topicId;
            if (topicId) {
              console.log(`主題 ${topicId} 的縮圖狀態檢查`);
              
              // 檢查是否有縮圖元素
              const thumbnail = topic.querySelector('.topic-list-data img, .topic-thumbnail img');
              if (thumbnail) {
                console.log(`主題 ${topicId} 有縮圖:`, thumbnail.src);
              } else {
                console.log(`主題 ${topicId} 沒有縮圖`);
              }
            }
          });
        }, 1000);
      });
    });
  }
}; 