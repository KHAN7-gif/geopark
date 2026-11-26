const LAND=['walk','bus','motor','car'],BOATS=['perahu','boat','boat_vip'];
export function travelOptions(from,to){
 const a=from?.access,b=to?.access;
 if(a?.island||b?.island)return a?.island&&a.island===b?.island&&!a.marineObservation&&!b.marineObservation?['walk']:[...BOATS];
 return [...LAND];
}
export function requiresWalkingApproach(site,mode){return site?.access?.walkingApproach===true&&['bus','motor','car'].includes(mode)}
export function accessDescription(site){return site?.access?.island?'Akses pulau: perahu / bot melalui jeti; berjalan kaki di pulau yang sama. Tapak pemerhatian laut memerlukan bot.':site?.access?.walkingApproach?'Akses hutan / denai: kenderaan ke akses jalan, kemudian berjalan kaki.':'Akses darat: jalan kaki, bas, motor atau kereta. Bot tidak digunakan.'}
