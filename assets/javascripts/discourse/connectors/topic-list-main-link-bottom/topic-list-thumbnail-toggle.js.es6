export default {
  setupComponent(args, component) {
    component.set("topic", args.topic);
  },
  
  actions: {
    toggleThumbnail() {
      const topic = this.get("topic");
      if (!topic) return;
      
      const newVal = !topic.tlp_show_thumbnail;
      topic.set("custom_fields", Object.assign({}, topic.custom_fields, { tlp_show_thumbnail: newVal }));
      topic.save({ custom_fields: topic.custom_fields });
    }
  }
}; 