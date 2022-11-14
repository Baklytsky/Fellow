# Fellow Redesign Project
Admin: https://partners.shopify.com/83182/stores/5762351219


## Usage
**Node.js version 14.0.0 or higher**

## Install packages

```bash
npm install
```

### Add and configure your config.yml file. You can copy this example below
```yaml
development:
  password: XXXXXXXXXXXXXX
  theme_id: XXXXXXXXXXXXXX
  store: XXXXXXXXXXXXXX.myshopify.com
  preview_url: XXXXXXXXXXXXXX.shopifypreview.com <= [NOT REQUIRED]
  ignore_files:
    - config/settings_data.json
```

## Basic commands

Basic commands for your theme:

`gulp watch` - Build and watch files

`theme deploy` - Deploy files

`theme download` - Download files

`theme download config/settings_data.json --no-ignore` - Download theme settings
