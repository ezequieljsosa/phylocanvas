$(function(){!function(){window.WGST.exports.mapFullscreenIdToTemplateId={"collection-map":"collection-map-fullscreen","collection-data":"collection-data-fullscreen"},window.WGST.exports.mapFullscreenIdToPanelType={"collection-map":"collection-map","collection-data":"collection-data"},window.WGST.exports.createFullscreen=function(e,l){if(!($('.wgst-fullscreen[data-fullscreen-id="'+e+'"]').length>0)){if("undefined"==typeof l)return console.error("[WGST][Error] No template context were provided."),void 0;l.fullscreenLabel=window.WGST.exports.getContainerLabel({containerName:"fullscreen",containerType:l.fullscreenType,containerId:e}),console.debug("templateContext.fullscreenType: "+l.fullscreenType);var n=window.WGST.exports.mapFullscreenIdToTemplateId[l.fullscreenType];console.debug("fullscreenTemplateId: "+n);var o=$('.wgst-template[data-template-id="'+n+'"]').html(),s=Handlebars.compile(o),t=s(l);$(".wgst-workspace").prepend(t),window.WGST.exports.createHidable(e,l.fullscreenLabel)}},window.WGST.exports.removeFullscreen=function(e){$('.wgst-fullscreen[data-fullscreen-id="'+e+'"]').remove(),window.WGST.exports.hidableFullscreenRemoved(e),"collection-map"===e&&window.WGST.geo.map.remove()},window.WGST.exports.showFullscreen=function(e){$('.wgst-fullscreen[data-fullscreen-id="'+e+'"]').removeClass("wgst--hide-this wgst--invisible-this"),window.WGST.exports.happenedShowFullscreen(e)},window.WGST.exports.hideFullscreen=function(e){$('.wgst-fullscreen[data-fullscreen-id="'+e+'"]').addClass("wgst--hide-this wgst--invisible-this"),window.WGST.exports.happenedHideFullscreen(e)},window.WGST.exports.toggleFullscreen=function(e){var l=$('.wgst-fullscreen[data-fullscreen-id="'+e+'"]');l.is(".wgst--hide-this, .wgst--invisible-this")?window.WGST.exports.showFullscreen(e):window.WGST.exports.hideFullscreen(e)},window.WGST.exports.bringFullscreenToFront=function(e){window.WGST.exports.bringContainerToFront("fullscreen",e)},window.WGST.exports.bringFullscreenToBack=function(e){$('.wgst-fullscreen[data-fullscreen-id="'+e+'"]').css("z-index","auto")},window.WGST.exports.bringFullscreenToPanel=function(e,l){if(0!==$('.wgst-fullscreen[data-fullscreen-id="'+e+'"]').length){var n=e.split("__")[0],o=e,s=e.split("__")[1],t=n;if(console.debug("[WGST][Debug] bringFullscreenToPanel | fullscreenType: "+t),console.debug("[WGST][Debug] bringFullscreenToPanel | fullscreenId: "+e),console.debug("[WGST][Debug] bringFullscreenToPanel | panelId: "+o),console.debug("[WGST][Debug] bringFullscreenToPanel | panelType: "+n),console.debug("[WGST][Debug] bringFullscreenToPanel | collectionID: "+s),window.WGST.exports.createPanel(n,{panelId:o,panelType:n,collectionId:s}),"undefined"!=typeof l&&l(),"collection-data"===t){var a=$('.wgst-fullscreen[data-fullscreen-id="'+e+'"]').find(".wgst-panel-body"),r=$('.wgst-panel[data-panel-id="'+o+'"]');r.find(".wgst-panel-body").replaceWith(a.clone(!0)),r.find(".wgst-collection-controls").removeClass("wgst--hide-this")}else"collection-map"===t&&$('.wgst-panel[data-panel-id="'+o+'"]').find(".wgst-panel-body-content").append(window.WGST.geo.map.canvas.getDiv());window.WGST.exports.removeFullscreen(e),window.WGST.exports.showPanel(o),"collection-map"===t&&google.maps.event.trigger(window.WGST.geo.map.canvas,"resize"),window.WGST.exports.bringPanelToFront(o),window.WGST.exports.happenedFullscreenToPanel(e)}},window.WGST.exports.bringPanelToFullscreen=function(e){var l=e.split("__")[0],n=e;if(console.debug("[WGST][Debug] bringPanelToFullscreen | fullscreenType: "+l),console.debug("[WGST][Debug] bringPanelToFullscreen | fullscreenId: "+n),console.debug("[WGST][Debug] bringPanelToFullscreen | panelId: "+e),!($('.wgst-fullscreen[data-fullscreen-id="'+n+'"]').length>0)){window.WGST.exports.createFullscreen(n,{fullscreenType:l,fullscreenId:n}),"undefined"!=typeof panelWasCreated&&panelWasCreated();var o=$('.wgst-panel[data-panel-id="'+e+'"]').attr("data-panel-type"),s=$('.wgst-fullscreen[data-fullscreen-id="'+n+'"]');if("collection-data"===o){var t=$('.wgst-panel[data-panel-id="'+e+'"]').find(".wgst-panel-body");t.clone(!0).appendTo(s),s.find(".wgst-collection-controls").addClass("wgst--hide-this")}else"collection-map"===o&&$('.wgst-fullscreen[data-fullscreen-id="'+n+'"]').find(".wgst-map").replaceWith(window.WGST.geo.map.canvas.getDiv());window.WGST.exports.showFullscreen(n),"collection-map"===o&&google.maps.event.trigger(window.WGST.geo.map.canvas,"resize"),window.WGST.exports.removePanel(e),window.WGST.exports.happenedPanelToFullscreen(e)}}}()});