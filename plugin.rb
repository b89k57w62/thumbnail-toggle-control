# name: discourse-thumbnail-toggle
# about: Adds a toggle button to show/hide topic thumbnails via a custom_field
# version: 1.0
# authors: Jeffrey
# url: https://github.com/b89k57w62/discourse-thumbnail-toggle

enabled_site_setting :thumbnail_toggle_enabled

register_asset "stylesheets/common/thumbnail-toggle.scss"

after_initialize do
  # 1. 註冊布林型 custom_field 存放顯示狀態
  Topic.register_custom_field_type('tlp_show_thumbnail', :boolean)

  # 2. 讓 PostRevisor 幫我們追蹤這個欄位的變動
  PostRevisor.track_topic_field(:tlp_show_thumbnail) do |tc, v|
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

  # 10. Patch TLP 的 Serializer
  DiscourseEvent.on(:topic_previews_ready) do
    next unless defined?(::TopicPreviews::TopicListItemSerializerExtension)

    module ::TopicPreviews
      module ThumbTogglePatch
        def thumbnail_url
          return nil unless object.tlp_show_thumbnail
          super
        end
      end
    end

    ::TopicPreviews::TopicListItemSerializerExtension.prepend(
      ::TopicPreviews::ThumbTogglePatch
    )
  end
end
