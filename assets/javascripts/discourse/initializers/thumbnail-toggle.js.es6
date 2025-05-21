import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "thumbnail-toggle",

  initialize() {
    console.log("[thumbnail-toggle] initializer loaded");

    withPluginApi("0.8.13", api => {
      const FIELD = "thumbnail_toggle_enabled";

      // Step 4：加一顆按鈕到 Topic Meta（🔧）下拉
      api.addTopicMenuButton("thumbnail-flag", attrs => {
        if (!attrs.currentUser?.staff) return;
        const on = attrs.topic.get(`custom_fields.${FIELD}`) === true;
        return {
          action: "toggleThumbnailFlag",
          icon: on ? "image" : "image-slash",
          label: on ? "隱藏縮圖" : "顯示縮圖",
        };
      });

      // Step 5：對應 controller:topic.action
      api.modifyClass("controller:topic", {
        pluginId: "thumbnail-toggle",
        actions: {
          toggleThumbnailFlag() {
            const topic = this.model;
            const current = topic.get(`custom_fields.${FIELD}`) === true;
            topic.set(`custom_fields.${FIELD}`, !current);
            topic
              .save({ custom_fields: topic.custom_fields })
              .then(() => this.appEvents.trigger("topic:custom-field-changed"));
          },
        },
      });
    });
  },
};
