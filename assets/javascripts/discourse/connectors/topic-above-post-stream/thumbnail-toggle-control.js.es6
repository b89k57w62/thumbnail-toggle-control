export default {
  setupComponent(attrs, component) {
    // 初始化檢查
    if (!attrs.context || !attrs.context.model) return;
  },
  
  actions: {
    toggleThumbnail() {
      const topic = this.get("context.model");
      if (!topic) return;
      
      // 調用主題控制器的操作
      const controller = this.get("context.controller");
      if (controller && controller.send) {
        controller.send("toggleThumbnail");
      }
    }
  }
}; 