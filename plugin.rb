# name: discourse-thumbnail-toggle
# about: Adds a toggle button to show/hide topic thumbnails via a custom_field
# version: 0.7
# authors: Jeffrey
# url: https://github.com/b89k57w62/discourse-thumbnail-toggle

register_asset "stylesheets/thumbnail-toggle.scss"

after_initialize do
  # 1️⃣ 註冊一個布林型 custom_field 存放顯示狀態
  Topic.register_custom_field_type('tlp_show_thumbnail', :boolean)

  # 2️⃣ 讓 PostRevisor 幫我們追蹤這個欄位的變動
  PostRevisor.track_topic_field(:tlp_show_thumbnail) do |tc, v|
    tc.topic.custom_fields['tlp_show_thumbnail'] = v
  end

  # 3️⃣ 預先把 custom_fields 撈出，避免 N+1 查詢
  if TopicList.respond_to?(:preloaded_custom_fields)
    TopicList.preloaded_custom_fields << 'tlp_show_thumbnail'
  end

  # 增加一個 topic 方法讓前端可以直接存取
  add_to_class(:topic, :tlp_show_thumbnail) do
    custom_fields['tlp_show_thumbnail']
  end

  # 序列化到 topic list item
  add_to_serializer(:topic_list_item, :tlp_show_thumbnail) do
    object.custom_fields['tlp_show_thumbnail']
  end

  # 序列化到 topic view
  add_to_serializer(:topic_view, :tlp_show_thumbnail) do
    object.topic.custom_fields['tlp_show_thumbnail']
  end

  # 4️⃣ Patch TLP 的 Serializer：只有在 flag = true 時，才把原本的 thumbnail_url 回傳給前端
  DiscourseEvent.on(:topic_previews_ready) do
    next unless defined?(::TopicPreviews::TopicListItemSerializerExtension)

    module ::TopicPreviews
      module ThumbTogglePatch
        def thumbnail_url
          return nil unless object.custom_fields['tlp_show_thumbnail']
          super
        end
      end
    end

    ::TopicPreviews::TopicListItemSerializerExtension.prepend(
      ::TopicPreviews::ThumbTogglePatch
    )
  end
end
