import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "thumbnail-toggle-control",

  initialize() {
    withPluginApi("0.8.13", api => {
      const FIELD = "tlp_show_thumbnail";

      // 在「⋯」主題選單加一顆布林開關按鈕
      api.addTopicMenuButton("thumbnail-flag", attrs => {
        if (!attrs.currentUser?.staff) return;

        const enabled = attrs.topic.get(`custom_fields.${FIELD}`) === true;
        return {
          action: "toggleThumbnailFlag",
          icon: enabled ? "image" : "image-slash",
          label: enabled ? "隱藏縮圖" : "顯示縮圖",
        };
      });

      // 點按鈕後的行為
      api.modifyClass("controller:topic", {
        pluginId: "thumbnail-toggle-control",

        actions: {
          toggleThumbnailFlag() {
            const topic = this.model;
            const current = topic.get(`custom_fields.${FIELD}`) === true;
            topic.set(`custom_fields.${FIELD}`, !current);

            // 儲存並觸發重新渲染
            topic
              .save({ custom_fields: topic.custom_fields })
              .then(() => this.appEvents.trigger("topic:custom-field-changed"));
          },
        },
      });
    });
  },
};
