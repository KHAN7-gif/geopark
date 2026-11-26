// Labuan adaptation of the compact, floating map-viewer interaction pattern.
// Original implementation; visual reference: https://github.com/rolux/gtamaplib-vc
export const VIEWER_LAYERS=['missions','jetties','route'];
export function viewerPreferences(raw){const layers={missions:true,jetties:true,route:true};for(const key of VIEWER_LAYERS)if(typeof raw?.layers?.[key]==='boolean')layers[key]=raw.layers[key];return {version:1,layers}}
export function viewportLabel(view){if(!view||![view.lat,view.lng,view.zoom,view.bearing].every(Number.isFinite))return 'Paparan kamera Labuan';const bearing=(view.bearing%360+360)%360;return `${view.lat.toFixed(5)}° U · ${view.lng.toFixed(5)}° T · Z ${view.zoom.toFixed(1)} · ${Math.round(bearing)%360}°`}
export function applyViewerLayers(map,markers,layers){const state=viewerPreferences({layers}).layers;for(const [id,marker] of markers){const element=marker.getElement();element.hidden=!state[id.startsWith('J')?'jetties':'missions']}
 for(const [key,ids]of Object.entries({missions:['labuan-mission-beacons'],jetties:['virtual-jetty-decks'],route:['route-halo','route-line','travelled-line']}))for(const id of ids)if(map.getLayer(id))map.setLayoutProperty(id,'visibility',state[key]?'visible':'none');
 return state;
}
