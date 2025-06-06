# name: thumbnail-toggle-control
# about: Adds a toggle button to show/hide topic thumbnails via a custom_field
# version: 1.1
# authors: Jeffrey
# url: https://github.com/b89k57w62/thumbnail-toggle-control

enabled_site_setting :thumbnail_toggle_enabled

register_asset "stylesheets/common/thumbnail-toggle.scss"

register_svg_icon "eye"
register_svg_icon "eye-slash"

after_initialize do
  Topic.register_custom_field_type('tlp_show_thumbnail', :boolean)

  PostRevisor.track_topic_field(:tlp_show_thumbnail) do |tc, v|
    Rails.logger.info "Thumbnail toggle: 更新主題 #{tc.topic.id} 的縮圖狀態為 #{v}"
    tc.topic.custom_fields['tlp_show_thumbnail'] = v
    tc.topic.save_custom_fields(true)
    
    DiscourseEvent.trigger(:thumbnail_state_changed, tc.topic, v)
  end

  if TopicList.respond_to?(:preloaded_custom_fields)
    TopicList.preloaded_custom_fields << 'tlp_show_thumbnail'
  end

  register_category_custom_field_type('thumbnail_toggle_enabled', :boolean)
  register_category_custom_field_type('thumbnail_toggle_default', :boolean)
  
  %w[thumbnail_toggle_enabled thumbnail_toggle_default].each do |key|
    Site.preloaded_category_custom_fields << key if Site.respond_to?(:preloaded_category_custom_fields)
    add_to_serializer(:basic_category, key.to_sym) { object.custom_fields[key] }
  end

  add_to_class(:topic, :tlp_show_thumbnail) do
    if custom_fields['tlp_show_thumbnail'].nil?
      if SiteSetting.thumbnail_toggle_category_override && category.present?
        if category.custom_fields['thumbnail_toggle_enabled']
          return category.custom_fields['thumbnail_toggle_default']
        end
      end
      return SiteSetting.thumbnail_toggle_default
    end
    custom_fields['tlp_show_thumbnail']
  end

  add_to_serializer(:topic_list_item, :tlp_show_thumbnail) do
    object.tlp_show_thumbnail
  end

  add_to_serializer(:topic_view, :tlp_show_thumbnail) do
    object.topic.tlp_show_thumbnail
  end

  on(:thumbnail_state_changed) do |topic, value|
  end

  Rails.logger.info "Thumbnail Toggle: 開始修補序列化器"
  
  TopicListItemSerializer.class_eval do
    if method_defined?(:image_url)
      alias_method :original_image_url, :image_url
      
      def image_url
        Rails.logger.info "TopicListItemSerializer#image_url called for topic #{object.id}, tlp_show_thumbnail: #{object.tlp_show_thumbnail} (#{object.tlp_show_thumbnail.class})"

        show_thumbnail = object.tlp_show_thumbnail
        if show_thumbnail == false
          Rails.logger.info "Topic #{object.id}: 縮圖被明確隱藏，返回 nil (值: #{show_thumbnail.inspect})"
          return nil
        end
        
        Rails.logger.info "Topic #{object.id}: 縮圖顯示，調用原始方法"
        result = original_image_url
        Rails.logger.info "Topic #{object.id}: 原始方法返回: #{result}"
        result
      end
    else
      def image_url
        Rails.logger.info "TopicListItemSerializer#image_url (new) called for topic #{object.id}, tlp_show_thumbnail: #{object.tlp_show_thumbnail} (#{object.tlp_show_thumbnail.class})"
        
        show_thumbnail = object.tlp_show_thumbnail
        if show_thumbnail == false
          Rails.logger.info "Topic #{object.id}: 縮圖被明確隱藏，返回 nil (值: #{show_thumbnail.inspect})"
          return nil
        end
        
        result = object.image_url if object.respond_to?(:image_url)
        Rails.logger.info "Topic #{object.id}: 新方法返回: #{result}"
        result
      end
    end
    
    if method_defined?(:thumbnail_url)
      alias_method :original_thumbnail_url, :thumbnail_url
      
      def thumbnail_url
        Rails.logger.info "TopicListItemSerializer#thumbnail_url called for topic #{object.id}, tlp_show_thumbnail: #{object.tlp_show_thumbnail} (#{object.tlp_show_thumbnail.class})"
        
        show_thumbnail = object.tlp_show_thumbnail
        if show_thumbnail == false
          Rails.logger.info "Topic #{object.id}: 縮圖被明確隱藏，返回 nil (值: #{show_thumbnail.inspect})"
          return nil
        end
        
        Rails.logger.info "Topic #{object.id}: 縮圖顯示，調用原始方法"
        result = original_thumbnail_url
        Rails.logger.info "Topic #{object.id}: 原始 thumbnail_url 返回: #{result}"
        result
      end
    end
  end
  
  if defined?(::TopicListItemEditsMixin)
    Rails.logger.info "Thumbnail Toggle: 檢測到 TLP sidecar 插件，修補 TopicListItemEditsMixin"
    
    ::TopicListItemEditsMixin.class_eval do
      if method_defined?(:image_url)
        alias_method :tlp_original_image_url, :image_url
        
        def image_url
          Rails.logger.info "TopicListItemEditsMixin#image_url called for topic #{object.id}, tlp_show_thumbnail: #{object.tlp_show_thumbnail} (#{object.tlp_show_thumbnail.class})"
          
          show_thumbnail = object.tlp_show_thumbnail
          if show_thumbnail == false
            Rails.logger.info "Topic #{object.id}: TLP sidecar 縮圖被明確隱藏，返回 nil (值: #{show_thumbnail.inspect})"
            return nil
          end
          
          Rails.logger.info "Topic #{object.id}: TLP sidecar 縮圖顯示，調用原始方法"
          result = tlp_original_image_url
          Rails.logger.info "Topic #{object.id}: TLP sidecar 原始方法返回: #{result}"
          result
        end
      end
      
      if method_defined?(:thumbnail_url)
        alias_method :tlp_original_thumbnail_url, :thumbnail_url
        
        def thumbnail_url
          Rails.logger.info "TopicListItemEditsMixin#thumbnail_url called for topic #{object.id}, tlp_show_thumbnail: #{object.tlp_show_thumbnail} (#{object.tlp_show_thumbnail.class})"
          
          show_thumbnail = object.tlp_show_thumbnail
          if show_thumbnail == false
            Rails.logger.info "Topic #{object.id}: TLP sidecar 縮圖被明確隱藏，返回 nil (值: #{show_thumbnail.inspect})"
            return nil
          end
          
          Rails.logger.info "Topic #{object.id}: TLP sidecar 縮圖顯示，調用原始方法"
          result = tlp_original_thumbnail_url
          Rails.logger.info "Topic #{object.id}: TLP sidecar 原始 thumbnail_url 返回: #{result}"
          result
        end
      end
    end
  else
    Rails.logger.info "Thumbnail Toggle: 未檢測到 TLP sidecar 插件"
  end

  Rails.logger.info "Thumbnail Toggle Control: 插件初始化完成"
end
