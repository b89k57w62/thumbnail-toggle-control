import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "thumbnail-toggle-button",

  initialize() {
    withPluginApi("1.4.0", (api) => {
      // 1️⃣ 把 tlp_show_thumbnail 序列化到 Ember Topic model
      api.serializeToTopic(
        "tlp_show_thumbnail",                   // client-side 属性名
        "topic.custom_fields.tlp_show_thumbnail" // 後端回傳路徑
      );

      // 2️⃣ 在 TLP 的 thumbnail connector 後面插入切換按鈕
      api.decorateWidget(
        "connector:topic-list-item-thumbnail:after",
        (helper) => {
          const { topic, currentUser } = helper.attrs;
          // （可選）僅允許 staff 使用者切換
          if (!currentUser?.staff) {
            return;
          }

          const FIELD = "tlp_show_thumbnail";
          const isOn = topic.tlp_show_thumbnail === true;
          const titleKey = isOn ? "thumbnail_toggle.hide" : "thumbnail_toggle.show";
          const iconClass = isOn ? "fa-image-slash" : "fa-image";

          return helper.h(
            "button.btn-icon.toggle-thumbnail-btn",
            {
              title: helper.i18n(titleKey),
              onclick: async () => {
                // 切換 flag 並存回後端
                topic.set("custom_fields", {
                  ...topic.custom_fields,
                  [FIELD]: !isOn,
                });
                await topic.save({ custom_fields: topic.custom_fields });
                helper.scheduleRerender(); // 重新 render，立即生效
              },
            },
            // FontAwesome icon
            helper.h("i.fa", { class: iconClass })
          );
        }
      );
    });
  },
};
