import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "thumbnail-toggle-control",
  initialize() {
    withPluginApi("1.4.0", api => {
      // We don't need to serialize the topic here, as we're already doing it in plugin.rb
      
      // Add our actions to the topic list item component
      api.modifyClass("component:topic-list-item", {
        actions: {
          toggleThumbnail() {
            const topic = this.topic;
            if (!topic) return;
            
            const newVal = !topic.tlp_show_thumbnail;
            topic.set("custom_fields", Object.assign({}, topic.custom_fields, { tlp_show_thumbnail: newVal }));
            topic.save({ custom_fields: topic.custom_fields });
          }
        }
      });
      
      // Add our actions to the topic controller for use in topic view
      api.modifyClass("controller:topic", {
        actions: {
          toggleThumbnail() {
            const model = this.model;
            if (!model) return;
            
            const newVal = !model.tlp_show_thumbnail;
            model.set("custom_fields", Object.assign({}, model.custom_fields, { tlp_show_thumbnail: newVal }));
            model.save({ custom_fields: model.custom_fields });
          }
        }
      });
    });
  }
};
