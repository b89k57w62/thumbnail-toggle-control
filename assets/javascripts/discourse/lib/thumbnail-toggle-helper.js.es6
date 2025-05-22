import { ajax } from "discourse/lib/ajax";

export default {
  toggleThumbnail(topic) {
    if (!topic) return;
    
    const newVal = !topic.tlp_show_thumbnail;
    const topicId = topic.id;
    
    // 先更新本地狀態以提供即時反饋
    topic.set("tlp_show_thumbnail", newVal);
    
    // 使用 ajax 調用而非直接修改模型
    return ajax(`/t/${topicId}`, {
      type: "PUT",
      data: { 
        tlp_show_thumbnail: newVal 
      }
    }).catch(error => {
      // 如果失敗，回滾狀態
      topic.set("tlp_show_thumbnail", !newVal);
      throw error;
    });
  }
}; 