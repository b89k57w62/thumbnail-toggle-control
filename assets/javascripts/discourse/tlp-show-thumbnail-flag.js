import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "tlp-boolean-thumbnail-flag",
  initialize() {
    withPluginApi("0.8.13", (api) => {
      const FIELD = "tlp_show_thumbnail";

      api.addTopicMenuButton("thumb-flag", (attrs) => {
        if (!attrs.currentUser?.staff) return;

        const enabled = attrs.topic.get(`custom_fields.${FIELD}`) === true;
        return {
          action: "toggleThumbFlag",
          icon: enabled ? "image" : "image-slash",
          label: enabled ? "隱藏縮圖" : "顯示縮圖",
        };
      });

      api.modifyClass("controller:topic", {
        pluginId: "tlp-boolean-thumbnail-flag",
        actions: {
          toggleThumbFlag() {
            const topic   = this.model;
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
