# Thumbnail Toggle Control

A Discourse plugin that adds toggle buttons to show/hide topic thumbnails on a per-topic basis, giving admin control over thumbnail visibility.

## Installation

1. Add the plugin repository to your `app.yml` file:

```yaml
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          - git clone https://github.com/b89k57w62/thumbnail-toggle-control.git
```

2. Rebuild your Discourse container:

```bash
cd /var/discourse
./launcher rebuild app
```

3. Enable the plugin in Admin → Plugins → Settings:
   - Check "thumbnail toggle enabled"
   - Configure default thumbnail display behavior
   - Optionally enable category-specific overrides

## Usage

Once installed, admin users will see toggle buttons next to topic titles that allow them to show or hide thumbnails for individual topics. The plugin works with both built-in Discourse thumbnails and Topic List Previews plugin. 