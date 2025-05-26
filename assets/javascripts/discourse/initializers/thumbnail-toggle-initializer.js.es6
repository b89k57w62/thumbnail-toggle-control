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
          
          // 立即在前端隱藏/顯示縮圖
          toggleThumbnailInDOM(topicId, newValue);
          
        }).catch(error => {
          console.error("無法更新縮圖狀態", error);
          // 如果失敗，回滾按鈕狀態
          if (icon) {
            icon.className = isCurrentlyShowing ? 'd-icon d-icon-far-image' : 'd-icon d-icon-far-image-slash';
          }
        });
      };
      
      // 直接在 DOM 中隱藏/顯示縮圖
      function toggleThumbnailInDOM(topicId, show) {
        console.log(`toggleThumbnailInDOM: 主題 ${topicId}, 顯示: ${show}`);
        
        // 查找主題行
        const topicRow = document.querySelector(`[data-topic-id="${topicId}"]`);
        if (!topicRow) {
          console.log("找不到主題行");
          return;
        }
        
        // 查找所有可能的縮圖元素 - 使用更廣泛的選擇器
        const possibleSelectors = [
          'img', // 所有圖片
          '.topic-list-data img',
          '.topic-thumbnail img',
          '.tlp-thumbnail img',
          '.topic-list-item-thumbnail img',
          '[class*="thumbnail"] img',
          '[class*="preview"] img'
        ];
        
        let thumbnailsFound = 0;
        
        possibleSelectors.forEach(selector => {
          const images = topicRow.querySelectorAll(selector);
          images.forEach(img => {
            // 檢查是否是真正的縮圖（排除頭像、圖標等）
            if (img.src && 
                (img.src.includes('uploads') || img.src.includes('optimized')) &&
                !img.src.includes('avatar') &&
                !img.src.includes('emoji') &&
                img.width > 50 && img.height > 50) { // 排除小圖標
              
              console.log(`找到縮圖: ${selector}`, img.src, `尺寸: ${img.width}x${img.height}`);
              
              if (show) {
                img.style.display = '';
                img.style.visibility = '';
                img.classList.remove('thumbnail-hidden');
              } else {
                img.style.display = 'none';
                img.classList.add('thumbnail-hidden');
              }
              thumbnailsFound++;
            }
          });
        });
        
        console.log(`主題 ${topicId} 找到 ${thumbnailsFound} 個縮圖`);
      }
      
      // 監聽頁面變更，應用縮圖隱藏邏輯
      api.onPageChange((url, title) => {
        console.log("頁面變更:", url, title);
        
        // 延遲執行以確保 TLP 已經渲染完成
        setTimeout(() => {
          applyThumbnailToggleToAllTopics();
        }, 2000);
      });
      
      // 應用縮圖切換邏輯到所有主題
      function applyThumbnailToggleToAllTopics() {
        const topics = document.querySelectorAll('.topic-list-item[data-topic-id]');
        console.log(`檢查 ${topics.length} 個主題的縮圖狀態`);
        
        topics.forEach(topic => {
          const topicId = topic.dataset.topicId;
          if (topicId) {
            checkAndApplyThumbnailState(topicId, topic);
          }
        });
      }
      
      // 檢查並應用縮圖狀態
      function checkAndApplyThumbnailState(topicId, topicElement) {
        // 首先檢查是否有切換按鈕
        const button = topicElement.querySelector('.toggle-thumbnail-btn');
        if (button) {
          const icon = button.querySelector('.d-icon');
          const shouldShow = icon && icon.classList.contains('d-icon-far-image');
          console.log(`主題 ${topicId} 從按鈕推斷狀態: ${shouldShow}`);
          toggleThumbnailInDOM(topicId, shouldShow);
          return;
        }
        
        // 如果沒有按鈕，通過 AJAX 獲取狀態
        ajax(`/t/${topicId}.json`).then(response => {
          if (response && response.tlp_show_thumbnail !== undefined) {
            const shouldShow = response.tlp_show_thumbnail;
            console.log(`主題 ${topicId} 從 API 獲取狀態: ${shouldShow}`);
            toggleThumbnailInDOM(topicId, shouldShow);
          }
        }).catch(error => {
          console.log(`無法獲取主題 ${topicId} 的狀態:`, error);
        });
      }
      
      // 初始應用邏輯
      setTimeout(() => {
        applyThumbnailToggleToAllTopics();
      }, 3000);
    });
  }
}; 