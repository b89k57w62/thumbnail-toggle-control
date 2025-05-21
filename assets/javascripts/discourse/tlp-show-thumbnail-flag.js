import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "tlp-show-thumbnail-flag",

  initialize() {
    console.log("[tlp-show-thumbnail-flag] initializer loaded");

    withPluginApi("0.8.13", api => {
      const FIELD = "tlp_show_thumbnail";

      api.addPostMenuButton("thumbnail-flag", attrs => {
        if (!attrs.currentUser?.staff) return;
        const enabled = attrs.post.get(`custom_fields.${FIELD}`) === true;
        return {
          action: "toggleThumbnailFlag",
          icon: enabled ? "image" : "image-slash",
          title: enabled ? "隱藏縮圖" : "顯示縮圖",
        };
      });

      api.modifyClass("controller:topic", {
        pluginId: "tlp-show-thumbnail-flag",
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
