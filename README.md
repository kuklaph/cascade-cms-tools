# Cascade CMS Tools

Various resources and functions to help interact with Cascade CMS

## Other Resources

**Cascade Conference 2024**  
Click [here](https://github.com/kuklaph/cascade-cms-tools/tree/main/cascade-conference-2024) if you're looking for UNCW's presentation (`The API Awakens: Unleashing Effeciency with Cascade`) resources from the 2024 Cascade Conference.

**Cascade CMS API**  
Javascript API library - [cascade-cms-api](https://github.com/kuklaph/cascade-cms-api)

## Helper Functions

Coming soon..

## Chrome Extension

This is a stripped down version of the ITS Web Assistant Chrome extension. You will need to change several items in order for it to work for your Cascade environment. This was originally created for our specific use case, so things are as modular as they could be. We are going for pure functionality to help us with our day to day tasks.

Because Cascade environments can be very different, some modules may not work at all. These will need to either be updated or just simply deleted if you don't need/want them.

Also, please note that these modules aren't perfect. They typically run "well enough" so you may still come across errors. Of course, we have our regular daily tasks that need to be done, so we can only devote so much time to the tools that help us actually do the tasks instead of simply doing the tasks.

Lastly, the Cascade CMS API Javascript library is included in this extension. You can use it outside of the extension for your own projects as well if you wish.

### Setup

This requires a Cascade API key to function. I recommend creating an API Read Only User with read access only to your sites. Assume its identity and create an API Key to use for your team. These actions do not perform any write tasks, so write is not necessary. At a future date we will most likely implement authentication. I recommend you do the same before implementing any logic that requires write access to your sites. Chrome extensions are sandboxed which does help with security, but better to safe.

#### Code/File Updates

- manifest.js
  - host_permissions
    - Add your web domain: "https://yourDomainName.edu/*"
    - Make sure you include the wildcard/format just like above
- exports.js
  - Scroll to bottom, update the `siteIDs` object to include your site IDs. **Note that these are not the parent folders within the site, but the actual site ID itself. These can be acquired from the `/listSites` endpoint.** The key reflects a site. Current is your production site. Feel free to add/remove the others if they aren't necessary, but you will need to make sure you do a search through the modules to make sure any references to these have been updated: `utils.siteIDs.blah` remove/update etc.
  - Update your `domainName` and `fullDomain` **Don't include http or https**
    - eg domainName = uncw / fullDomain = uncw.edu

#### Add Extension To Browser

This can be added to Chromium based browsers (e.g. Chrome/edge etc). To add to your browser go to your extensions area ([insert browser here] edge://extensions/) Toggle on Developer mode. Then you can click `Load Unpacked` and navigate to the top level `chrome` folder. Once it's loaded, you'll want to click the popup and load in your Cascade API.

If you want to use in Firefox, you would need to create a manifest file that matches that of Firefox requirements and in theory it should still work.

Make sure to refresh any web page you had open otherwise you'll be working on the old preloaded page that doesn't actually have any of the code from the extension. This applies to any updates you make to the extension in the future as well. Update Code? > refresh extension (don't need to remove, just click the refresh button in your `browser://extension` dev settings) > refresh page(s) > always
