import Component from "@glimmer/component";
import { service } from "@ember/service";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";

export default class ThumbnailToggleControl extends Component {
  @service siteSettings;
  @service currentUser;

  get topic() {
    // 嘗試多種方式獲取 topic
    return this.args.outletArgs?.model || 
           this.args.outletArgs?.topic || 
           this.args.model || 
           this.args.topic;
  }

  @action
  toggleThumbnail() {
    const topic = this.topic;
    if (!topic) {
      return;
    }
    
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
    }).then(() => {
      // 觸發重新渲染
      topic.notifyPropertyChange("tlp_show_thumbnail");
    }).catch(error => {
      // 如果失敗，回滾操作
      topic.set("tlp_show_thumbnail", currentValue);
    });
  }
} 