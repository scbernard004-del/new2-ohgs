(function(){
  'use strict';
  var button=document.getElementById('check-deployment');
  if(!button)return;
  var expected=document.querySelector('meta[name="ohgs-release"]').content;
  var status=document.getElementById('deployment-check-status');
  var fileRelease=null,result='ready',assetCount=null,videoChecks=[],videoTotal=null;
  var requiredFiles=[
    ['media/flyers/ohgs-compact-batching-plant-nov2026-480.webp','image/webp'],
    ['media/flyers/ohgs-compact-batching-plant-nov2026-768.webp','image/webp'],
    ['media/flyers/ohgs-compact-batching-plant-nov2026-1121.webp','image/webp'],
    ['media/flyers/ohgs-compact-batching-plant-nov2026.jpg','image/jpeg'],
    ['media/flyers/ohgs-friday-nov2026-480.webp','image/webp'],
    ['media/flyers/ohgs-friday-nov2026-768.webp','image/webp'],
    ['media/flyers/ohgs-friday-nov2026-1254.webp','image/webp'],
    ['media/flyers/ohgs-friday-nov2026.jpg','image/jpeg'],
    ['product-compact-concrete-batching-plant.html','text/html'],
    ['ohgs-daily-flyers.js','javascript']
  ];
  async function checkVideoFiles(signal){
    var response=await fetch('ohgs-video-manifest.json?v='+expected,{cache:'no-store',signal:signal});
    if(!response.ok)throw new Error('Video manifest missing');
    var manifest=await response.json();
    if(manifest.release!==expected||!Array.isArray(manifest.assets)||!manifest.assets.length||manifest.assets.length>100)throw new Error('Video manifest mismatch');
    var assets=manifest.assets;
    if(assets.some(function(asset){return typeof asset.path!=='string'||!asset.path.startsWith('media/')||asset.path.includes('..')||!['video','poster'].includes(asset.kind)}))throw new Error('Invalid video manifest');
    videoTotal=assets.length;videoChecks=new Array(assets.length);var next=0;
    async function check(asset){
      var result={path:asset.path,ok:false,status:0};
      try{
        var isVideo=asset.kind==='video';
        var reply=await fetch(asset.path+'?v='+expected,{method:isVideo?'GET':'HEAD',headers:isVideo?{'Range':'bytes=0-31'}:{},cache:'no-store',signal:signal});
        result.status=reply.status;
        if(!reply.ok||!(reply.headers.get('content-type')||'').includes(asset.type))return result;
        if(isVideo){
          // Read only a tiny MP4 header, including when a server ignores Range.
          var first=new Uint8Array(32),used=0;
          if(reply.body&&reply.body.getReader){
            var reader=reply.body.getReader();
            try{while(used<first.length){var chunk=await reader.read();if(chunk.done)break;var count=Math.min(chunk.value.length,first.length-used);first.set(chunk.value.subarray(0,count),used);used+=count}}
            finally{await reader.cancel()}
          }else{
            var bytes=new Uint8Array(await reply.arrayBuffer());used=Math.min(32,bytes.length);first.set(bytes.subarray(0,used));
          }
          result.ok=used>=8&&String.fromCharCode.apply(null,Array.prototype.slice.call(first,4,8))==='ftyp';
        }else result.ok=true;
      }catch(error){}
      return result;
    }
    await Promise.all([0,1,2].map(async function(){while(next<assets.length){var index=next++;videoChecks[index]=await check(assets[index])}}));
    return videoChecks.every(function(check){return check.ok});
  }
  function sw(){return document.documentElement.lang==='sw'}
  function render(){
    var runtime=document.documentElement.dataset.ohgsMediaRelease;
    document.getElementById('release-html').textContent=expected;
    document.getElementById('release-runtime').textContent=runtime||(sw()?'Haijapakia':'Not loaded');
    document.getElementById('release-file').textContent=fileRelease||(sw()?'Bado haijakaguliwa':'Not checked yet');
    var assets=document.getElementById('release-flyers');
    if(assets)assets.textContent=assetCount===null?(sw()?'Bado haijakaguliwa':'Not checked yet'):assetCount+' / '+requiredFiles.length+' '+(sw()?'yanapatikana':'available');
    var videoSummary=document.getElementById('release-videos');
    if(videoSummary)videoSummary.textContent=videoTotal===null?(sw()?'Bado haijakaguliwa':'Not checked yet'):videoChecks.filter(function(check){return check&&check.ok}).length+' / '+videoTotal+' '+(sw()?'yanapatikana':'available');
    var videoList=document.getElementById('video-media-results');
    if(videoList){videoList.replaceChildren();videoChecks.forEach(function(check){if(!check)return;var row=document.createElement('li'),name=document.createElement('code'),state=document.createElement('span');name.textContent=check.path;state.textContent=(check.ok?(sw()?'Linapatikana':'Available'):(sw()?'Halipo au si sahihi':'Missing or invalid'))+(check.status?' ('+check.status+')':'');row.append(name,state);videoList.appendChild(row)})}
    var messages={
      ready:['Check the release, every video and poster, and the new flyer files.','Kagua toleo, kila video na picha yake, pamoja na mafaili mapya ya matangazo.'],
      checking:['Checking deployed files…','Mafaili yanakaguliwa…'],
      success:['The release matches and all videos, posters and flyer files are available. Open Home to test playback.','Toleo linafanana na video, picha za video na matangazo yote yanapatikana. Fungua Mwanzo kujaribu video.'],
      'video-missing':['Some video files are missing or invalid. Open the video results below, upload the complete repair media folder, and redeploy.','Baadhi ya mafaili ya video hayapo au si sahihi. Fungua matokeo ya video hapa chini, pakia folda nzima ya media ya marekebisho kisha sambaza upya.'],
      'video-manifest':['The video file list is missing or out of date. Upload all files from the repair package and redeploy.','Orodha ya mafaili ya video haipo au ni ya zamani. Pakia mafaili yote ya kifurushi cha marekebisho kisha sambaza upya.'],
      missing:['Some new flyer files are missing or have the wrong file type. Upload the complete media/flyers folder and redeploy.','Baadhi ya mafaili mapya ya matangazo hayapo au yana aina isiyo sahihi. Pakia folda nzima ya media/flyers kisha sambaza upya.'],
      mismatch:['The files do not match. Upload the complete package and redeploy the connected project.','Mafaili hayafanani. Pakia kifurushi kizima kisha sambaza upya mradi uliounganishwa.'],
      error:['The version file could not be checked. Confirm the upload and try again.','Faili la toleo halikuweza kukaguliwa. Hakikisha limepakiwa kisha jaribu tena.']
    };
    status.textContent=messages[result][sw()?1:0];status.dataset.result=result;
  }
  button.addEventListener('click',async function(){
    if(button.disabled)return;
    button.disabled=true;button.classList.add('is-sending');button.setAttribute('aria-busy','true');result='checking';render();
    var controller=window.AbortController?new AbortController():null;
    var timer=setTimeout(function(){if(controller)controller.abort()},25000);
    try{
      var response=await fetch('version-check.txt',{cache:'no-store',signal:controller?controller.signal:undefined});
      if(!response.ok)throw new Error('Version request failed');
      var content=await response.text();var match=content.match(/^OHGS RELEASE (v\d+-[a-z0-9-]+)/);
      fileRelease=match?match[1]:null;
      var checks=await Promise.all(requiredFiles.map(async function(item){
        try{var asset=await fetch(item[0],{method:'HEAD',cache:'no-store',signal:controller?controller.signal:undefined});return asset.ok&&(asset.headers.get('content-type')||'').includes(item[1])}catch(error){return false}
      }));
      assetCount=checks.filter(Boolean).length;
      var videoOkay=false,manifestOkay=true;
      try{videoOkay=await checkVideoFiles(controller?controller.signal:undefined)}catch(error){manifestOkay=false}
      result=fileRelease!==expected||document.documentElement.dataset.ohgsMediaRelease!==expected?'mismatch':!manifestOkay?'video-manifest':!videoOkay?'video-missing':assetCount===requiredFiles.length?'success':'missing';
    }catch(error){result='error'}
    finally{clearTimeout(timer);button.disabled=false;button.classList.remove('is-sending');button.removeAttribute('aria-busy');render()}
  });
  window.addEventListener('ohgs:languagechange',render);render();
})();
