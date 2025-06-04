import Component from "@glimmer/component";
import { service } from "@ember/service";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";

export default class ThumbnailToggleControl extends Component {
  @service siteSettings;
  @service currentUser;

  get topic() {
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
    
    topic.set("tlp_show_thumbnail", newValue);
    
    ajax(`/t/${topic.id}`, {
      type: "PUT",
      data: { 
        tlp_show_thumbnail: newValue 
      }
    }).then(() => {
      topic.notifyPropertyChange("tlp_show_thumbnail");
    }).catch(error => {
      topic.set("tlp_show_thumbnail", currentValue);
    });
  }
} 