import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";

export default {
  name: "thumbnail-toggle-initializer",
  
  initialize() {
    withPluginApi("0.8.31", api => {
      // 全局函數供 raw template 使用
      window.toggleThumbnail = function(topicId) {
        // 查找按鈕元素來確定當前狀態
        const button = document.querySelector(`[data-topic-id="${topicId}"] .toggle-thumbnail-btn`);
        if (!button) {
          return;
        }
        
        // 通過圖標判斷當前狀態
        const icon = button.querySelector('.d-icon');
        const isCurrentlyShowing = icon && icon.classList.contains('d-icon-far-image');
        const newValue = !isCurrentlyShowing;
        
        // 立即更新按鈕狀態和縮圖顯示以提供即時反饋
        if (icon) {
          icon.className = newValue ? 'd-icon d-icon-far-image' : 'd-icon d-icon-far-image-slash';
          button.title = newValue ? '隱藏縮圖' : '顯示縮圖';
        }
        
        // 立即在前端隱藏/顯示縮圖
        toggleThumbnailInDOM(topicId, newValue);
        
        // 發送 AJAX 請求
        ajax(`/t/${topicId}`, {
          type: "PUT",
          data: { 
            tlp_show_thumbnail: newValue 
          }
        }).catch(error => {
          // 如果失敗，回滾按鈕狀態和縮圖顯示
          if (icon) {
            icon.className = isCurrentlyShowing ? 'd-icon d-icon-far-image' : 'd-icon d-icon-far-image-slash';
            button.title = isCurrentlyShowing ? '隱藏縮圖' : '顯示縮圖';
          }
          toggleThumbnailInDOM(topicId, isCurrentlyShowing);
        });
      };
      
      // 直接在 DOM 中隱藏/顯示縮圖
      function toggleThumbnailInDOM(topicId, show) {
        // 查找主題行
        const topicRow = document.querySelector(`[data-topic-id="${topicId}"]`);
        if (!topicRow) {
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
        
        possibleSelectors.forEach(selector => {
          const images = topicRow.querySelectorAll(selector);
          images.forEach(img => {
            // 檢查是否是真正的縮圖（排除頭像、圖標等）
            if (img.src && 
                (img.src.includes('uploads') || img.src.includes('optimized')) &&
                !img.src.includes('avatar') &&
                !img.src.includes('emoji') &&
                img.width > 50 && img.height > 50) { // 排除小圖標
              
              if (show) {
                img.style.display = '';
                img.style.visibility = '';
                img.classList.remove('thumbnail-hidden');
              } else {
                img.style.display = 'none';
                img.classList.add('thumbnail-hidden');
              }
            }
          });
        });
      }
      
      // 監聽頁面變更，應用縮圖隱藏邏輯
      api.onPageChange((url, title) => {
        // 縮短延遲時間到500毫秒，提供更快的響應
        setTimeout(() => {
          applyThumbnailToggleToAllTopics();
        }, 500);
      });
      
      // 應用縮圖切換邏輯到所有主題
      function applyThumbnailToggleToAllTopics() {
        const topics = document.querySelectorAll('.topic-list-item[data-topic-id]');
        
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
          toggleThumbnailInDOM(topicId, shouldShow);
          return;
        }
        
        // 如果沒有按鈕，通過 AJAX 獲取狀態
        ajax(`/t/${topicId}.json`).then(response => {
          if (response && response.tlp_show_thumbnail !== undefined) {
            const shouldShow = response.tlp_show_thumbnail;
            toggleThumbnailInDOM(topicId, shouldShow);
          }
        }).catch(error => {
          // 靜默處理錯誤
        });
      }
      
      // 縮短初始延遲時間到1秒，提供更快的初始化
      setTimeout(() => {
        applyThumbnailToggleToAllTopics();
      }, 1000);
    });
  }
}; 