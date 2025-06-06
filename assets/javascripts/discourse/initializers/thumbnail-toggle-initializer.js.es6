import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";

export default {
  name: "thumbnail-toggle-initializer",
  
  initialize() {
    withPluginApi("0.8.31", api => {
      window.toggleThumbnail = function(topicId) {
        const button = document.querySelector(`[data-topic-id="${topicId}"] .toggle-thumbnail-btn`);
        if (!button) {
          return;
        }
        
        const icon = button.querySelector('.d-icon');
        const isCurrentlyShowing = icon && icon.classList.contains('d-icon-eye');
        const newValue = !isCurrentlyShowing;
        
        if (icon) {
          icon.className = newValue ? 'd-icon d-icon-eye' : 'd-icon d-icon-eye-slash';
          const btnText = button.querySelector('.btn-text');
          if (btnText) {
            btnText.textContent = newValue ? I18n.t('js.thumbnail_toggle.hide') : I18n.t('js.thumbnail_toggle.show');
          }
          button.title = newValue ? I18n.t('js.thumbnail_toggle.hide_thumbnail') : I18n.t('js.thumbnail_toggle.show_thumbnail');
        }
        
        toggleThumbnailInDOM(topicId, newValue);
        
        ajax(`/t/${topicId}`, {
          type: "PUT",
          data: { 
            tlp_show_thumbnail: newValue 
          }
        }).catch(error => {
          if (icon) {
            icon.className = isCurrentlyShowing ? 'd-icon d-icon-eye' : 'd-icon d-icon-eye-slash';
            const btnText = button.querySelector('.btn-text');
            if (btnText) {
              btnText.textContent = isCurrentlyShowing ? I18n.t('js.thumbnail_toggle.hide') : I18n.t('js.thumbnail_toggle.show');
            }
            button.title = isCurrentlyShowing ? I18n.t('js.thumbnail_toggle.hide_thumbnail') : I18n.t('js.thumbnail_toggle.show_thumbnail');
          }
          toggleThumbnailInDOM(topicId, isCurrentlyShowing);
        });
      };
      
      function toggleThumbnailInDOM(topicId, show) {
        const topicRow = document.querySelector(`[data-topic-id="${topicId}"]`);
        if (!topicRow) {
          return;
        }
        
        const possibleSelectors = [
          'img',
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
            if (img.src && 
                (img.src.includes('uploads') || img.src.includes('optimized') || img.src.includes('/images/')) &&
                !img.src.includes('avatar') &&
                !img.src.includes('emoji')) {
              
              const isPossibleThumbnail = 
                img.naturalWidth > 50 ||
                img.width > 50 ||
                img.getAttribute('width') > 50 ||
                img.parentElement.classList.contains('thumbnail') ||
                img.parentElement.classList.contains('preview') ||
                img.classList.contains('thumbnail') ||
                img.classList.contains('preview');
                
              const isImageLoaded = img.complete && img.naturalHeight !== 0;
              
              if (isPossibleThumbnail || !isImageLoaded) {
                if (show) {
                  img.style.display = '';
                  img.style.visibility = '';
                  img.classList.remove('thumbnail-hidden');
                } else {
                  img.style.display = 'none';
                  img.classList.add('thumbnail-hidden');
                }
              }
            }
          });
        });
        
        setTimeout(() => {
          possibleSelectors.forEach(selector => {
            const images = topicRow.querySelectorAll(selector);
            images.forEach(img => {
              if (img.src && 
                  (img.src.includes('uploads') || img.src.includes('optimized') || img.src.includes('/images/')) &&
                  !img.src.includes('avatar') &&
                  !img.src.includes('emoji') &&
                  (img.naturalWidth > 50 && img.naturalHeight > 50)) {
                
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
        }, 100);
      }
      
      api.onPageChange((url, title) => {
        setTimeout(() => {
          applyThumbnailToggleToAllTopics();
        }, 500);
      });
      
      function applyThumbnailToggleToAllTopics() {
        const topics = document.querySelectorAll('.topic-list-item[data-topic-id]');
        
        topics.forEach(topic => {
          const topicId = topic.dataset.topicId;
          if (topicId) {
            checkAndApplyThumbnailState(topicId, topic);
          }
        });
      }
      
      function checkAndApplyThumbnailState(topicId, topicElement) {
        const button = topicElement.querySelector('.toggle-thumbnail-btn');
        if (button) {
          const icon = button.querySelector('.d-icon');
          const shouldShow = icon && icon.classList.contains('d-icon-eye');
          toggleThumbnailInDOM(topicId, shouldShow);
          return;
        }
        
        ajax(`/t/${topicId}.json`).then(response => {
          if (response && response.tlp_show_thumbnail !== undefined) {
            const shouldShow = response.tlp_show_thumbnail;
            toggleThumbnailInDOM(topicId, shouldShow);
          }
        }).catch(error => {
        });
      }
      
      // 增加多次嘗試，確保在手機設備上也能正確初始化
      setTimeout(() => {
        applyThumbnailToggleToAllTopics();
      }, 1000);
      
      // 手機設備可能需要更長時間載入
      setTimeout(() => {
        applyThumbnailToggleToAllTopics();
      }, 2000);
    });
  }
}; 