export const DEFAULT_HUD={infoCollapsed:true,timerCollapsed:true,focus:false,sound:true};
export function hudPreferences(raw){return Object.fromEntries(Object.entries(DEFAULT_HUD).map(([key,value])=>[key,typeof raw?.[key]==='boolean'?raw[key]:value]))}
export function toggleHudPart(prefs,part){if(!['infoCollapsed','timerCollapsed'].includes(part))return hudPreferences(prefs);return {...hudPreferences(prefs),focus:false,[part]:prefs.focus?false:!prefs[part]}}
