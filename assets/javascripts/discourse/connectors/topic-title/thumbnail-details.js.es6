export default {
  setupComponent(args, component) {
    component.set("model", args.model);
  },
  
  actions: {
    toggleThumbnail() {
      const model = this.get("model");
      if (!model) return;
      
      const newVal = !model.tlp_show_thumbnail;
      model.set("custom_fields", Object.assign({}, model.custom_fields, { tlp_show_thumbnail: newVal }));
      model.save({ custom_fields: model.custom_fields });
    }
  }
}; 