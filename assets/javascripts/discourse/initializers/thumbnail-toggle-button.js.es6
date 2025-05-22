import { withPluginApi } from "discourse/lib/plugin-api";
export default {
  name: "thumbnail-toggle-control",
  initialize() {
    withPluginApi("1.4.0", api => {
      api.serializeToTopic("tlp_show_thumbnail", "topic.custom_fields.tlp_show_thumbnail");

      api.decorateWidget("connector:topic-list-main-link-bottom:after", helper => {
        const { topic } = helper.attrs;
        if (!topic.thumbnail_url) return;
        return helper.h("button.btn-icon.toggle-thumbnail-btn", {
          title: helper.i18n(topic.tlp_show_thumbnail ? "thumbnail_toggle.hide" : "thumbnail_toggle.show"),
          onclick: async () => {
            const newVal = !topic.tlp_show_thumbnail;
            topic.set("custom_fields", { ...topic.custom_fields, tlp_show_thumbnail: newVal });
            await topic.save({ custom_fields: topic.custom_fields });
            helper.scheduleRerender();
          }
        }, helper.h("i.fa", { class: topic.tlp_show_thumbnail ? "fa-image-slash" : "fa-image" }));
      });

      api.decorateWidget("connector:topic-title-thumbnail:after", helper => {
        const model = helper.attrs.outletArgs.model;
        if (!model.thumbnail_url) return;
        return helper.h("button.btn-icon.toggle-thumbnail-btn", {
          title: helper.i18n(model.tlp_show_thumbnail ? "thumbnail_toggle.hide" : "thumbnail_toggle.show"),
          onclick: async () => {
            const newVal = !model.tlp_show_thumbnail;
            model.set("custom_fields", { ...model.custom_fields, tlp_show_thumbnail: newVal });
            await model.save({ custom_fields: model.custom_fields });
            helper.scheduleRerender();
          }
        }, helper.h("i.fa", { class: model.tlp_show_thumbnail ? "fa-image-slash" : "fa-image" }));
      });
    });
  }
};
