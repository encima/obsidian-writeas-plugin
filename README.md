# Obsidian Writeas Plugin

## What?

Publish notes to https://write.as or a self-hosted [WriteFreely](https://writefreely.org/) instance.

## Disclosure

1. This plugin publishes content using the Internet
2. This plugin requires an account with https://write.as or a self-hosted
   [WriteFreely](https://writefreely.org/)

## How?

1. Set your username, password, and optionally your WriteFreely instance URL 
   in the plugin settings
2. Add `writeas_collection` into your frontmatter, set it to a collection/blog
   that you own (this **must** be set)
   - If you're using a self-hosted WriteFreely instance in single-user mode, 
     the `writeas_collection` value must be equal to your username
3. Run `Publish/update` (or use alt+shift+p)
4. The plugin will add the ID and the post URL to your frontmatter. Subsequent
   publish commands will then update the same post.

## API Documentation

See https://developers.write.as/docs
