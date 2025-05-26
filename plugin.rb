# name: thumbnail-toggle-control
# about: Adds a toggle button to show/hide topic thumbnails via a custom_field
# version: 1.1
# authors: Jeffrey
# url: https://github.com/b89k57w62/thumbnail-toggle-control

enabled_site_setting :thumbnail_toggle_enabled

register_asset "stylesheets/common/thumbnail-toggle.scss"

after_initialize do
  # 1. 註冊布林型 custom_field 存放顯示狀態
  Topic.register_custom_field_type('tlp_show_thumbnail', :boolean)

  # 2. 讓 PostRevisor 幫我們追蹤這個欄位的變動
  PostRevisor.track_topic_field(:tlp_show_thumbnail) do |tc, v|
    Rails.logger.info "Thumbnail toggle: 更新主題 #{tc.topic.id} 的縮圖狀態為 #{v}"
    tc.topic.custom_fields['tlp_show_thumbnail'] = v
    tc.topic.save_custom_fields(true)
    
    # 觸發自定義事件
    DiscourseEvent.trigger(:thumbnail_state_changed, tc.topic, v)
  end

  # 3. 預先把 custom_fields 撈出，避免 N+1 查詢
  if TopicList.respond_to?(:preloaded_custom_fields)
    TopicList.preloaded_custom_fields << 'tlp_show_thumbnail'
  end

  # 4. 註冊分類級別的設置
  register_category_custom_field_type('thumbnail_toggle_enabled', :boolean)
  register_category_custom_field_type('thumbnail_toggle_default', :boolean)
  
  # 5. 預載分類自定義欄位
  %w[thumbnail_toggle_enabled thumbnail_toggle_default].each do |key|
    Site.preloaded_category_custom_fields << key if Site.respond_to?(:preloaded_category_custom_fields)
    add_to_serializer(:basic_category, key.to_sym) { object.custom_fields[key] }
  end

  # 6. 增加 topic 方法讓前端可以直接存取
  add_to_class(:topic, :tlp_show_thumbnail) do
    if custom_fields['tlp_show_thumbnail'].nil?
      # 如果主題沒有設置，檢查分類設置
      if SiteSetting.thumbnail_toggle_category_override && category.present?
        if category.custom_fields['thumbnail_toggle_enabled']
          return category.custom_fields['thumbnail_toggle_default']
        end
      end
      # 否則使用全局默認值
      return SiteSetting.thumbnail_toggle_default
    end
    custom_fields['tlp_show_thumbnail']
  end

  # 7. 序列化到 topic list item
  add_to_serializer(:topic_list_item, :tlp_show_thumbnail) do
    object.tlp_show_thumbnail
  end

  # 8. 序列化到 topic view
  add_to_serializer(:topic_view, :tlp_show_thumbnail) do
    object.topic.tlp_show_thumbnail
  end

  # 9. 監聽事件
  on(:thumbnail_state_changed) do |topic, value|
    # 將來可能的操作，例如通知、日誌等
  end

  # 10. 直接修補 TopicListItemSerializer
  TopicListItemSerializer.class_eval do
    # 保存原始方法
    if method_defined?(:image_url)
      alias_method :original_image_url, :image_url
    end
    
    if method_defined?(:thumbnail_url)
      alias_method :original_thumbnail_url, :thumbnail_url
    end
    
    # 重新定義 image_url 方法
    def image_url
      Rails.logger.debug "TopicListItemSerializer#image_url called for topic #{object.id}, tlp_show_thumbnail: #{object.tlp_show_thumbnail}"
      
      # 如果 tlp_show_thumbnail 為 false，返回 nil
      return nil unless object.tlp_show_thumbnail
      
      # 調用原始方法
      if respond_to?(:original_image_url)
        original_image_url
      else
        # 基本實現
        object.image_url if object.respond_to?(:image_url)
      end
    end
    
    # 重新定義 thumbnail_url 方法
    def thumbnail_url
      Rails.logger.debug "TopicListItemSerializer#thumbnail_url called for topic #{object.id}, tlp_show_thumbnail: #{object.tlp_show_thumbnail}"
      
      # 如果 tlp_show_thumbnail 為 false，返回 nil
      return nil unless object.tlp_show_thumbnail
      
      # 調用原始方法
      if respond_to?(:original_thumbnail_url)
        original_thumbnail_url
      else
        # 回退到 image_url
        image_url
      end
    end
  end

  Rails.logger.info "Thumbnail Toggle Control: 插件初始化完成"
end
