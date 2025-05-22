console.log("[thumbnail-toggle-button] initializer loaded");

import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "thumbnail-toggle-button",

  initialize() {
    withPluginApi("0.11.1", (api) => {
      api.decorateWidget("component-connector:after", (helper) => {
        // 只针对 TLP 缩图的 connector
        if (helper.attrs.name !== "topic-list-item-thumbnail") {
          return;
        }

        const { topic, currentUser } = helper.attrs;
        if (!currentUser?.staff) return;

        const FIELD = "tlp_show_thumbnail";
        const on    = topic.custom_fields?.[FIELD] === true;
        const title = on ? "thumbnail_toggle.hide" : "thumbnail_toggle.show";
        const icon  = on ? "image-slash" : "image";

        return helper.h(
          "button.thumbnail-toggle-btn",
          {
            title: helper.i18n(title),
            onclick: async () => {
              topic.custom_fields[FIELD] = !on;
              await topic.save({ custom_fields: topic.custom_fields });
              window.location.reload();
            },
          },
          helper.h("i.fa", { class: `fa-${icon}` })
        );
      });
    });
  },
};
