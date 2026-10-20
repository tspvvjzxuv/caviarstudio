var e=Object.defineProperty,t=(t,n,r)=>n in t?e(t,n,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[n]=r,n=(e,n,r)=>t(e,typeof n==`symbol`?n:n+``,r),r=class extends Error{constructor(e,t){super(`[MeltGL:${e}] ${t}`),n(this,`code`),this.name=`MeltError`,this.code=e}};function i(e,t,n){if(!e)throw new r(t,n)}var a=(e,t,n)=>e<t?t:e>n?n:e,o=e=>a(e,0,1),s=(e,t,n)=>e+(t-e)*n,c=e=>{let t=2166136261;for(let n=0;n<e.length;n+=1)t^=e.charCodeAt(n),t=Math.imul(t,16777619);return t>>>0},l={linear:e=>e,easeInQuad:e=>e*e,easeOutQuad:e=>e*(2-e),easeInCubic:e=>e*e*e,easeOutCubic:e=>1-(1-e)**3,easeInOutCubic:e=>e<.5?4*e*e*e:1-(-2*e+2)**3/2,easeOutQuint:e=>1-(1-e)**5,easeInOutSine:e=>-(Math.cos(Math.PI*e)-1)/2,easeInExpo:e=>e===0?0:2**(10*e-10)},u=e=>typeof e==`function`?e:l[e],d=class{constructor(){n(this,`listeners`,new Map)}on(e,t){let n=this.listeners.get(e);return n||(n=new Set,this.listeners.set(e,n)),n.add(t),()=>this.off(e,t)}once(e,t){let n=this.on(e,e=>{n(),t(e)});return n}off(e,t){this.listeners.get(e)?.delete(t)}emit(e,t){let n=this.listeners.get(e);if(n&&n.size!==0)for(let e of[...n])e(t)}clear(){this.listeners.clear()}},f=class extends d{constructor(e={}){super(),n(this,`timeScale`),n(this,`handle`,0),n(this,`last`,0),n(this,`frame`,0),n(this,`elapsed`,0),n(this,`active`,!1),n(this,`resumeWhenVisible`,!1),n(this,`maxDelta`),n(this,`pauseWhenHidden`),n(this,`loop`,e=>{if(!this.active)return;this.handle=requestAnimationFrame(this.loop);let t=Math.min((e-this.last)/1e3,this.maxDelta)*this.timeScale;this.last=e,this.elapsed+=t,this.frame+=1,this.emit(`tick`,{time:this.elapsed,delta:t,frame:this.frame})}),n(this,`onVisibilityChange`,()=>{if(document.hidden){let e=this.active;this.stop(),this.resumeWhenVisible=e}else this.resumeWhenVisible&&(this.resumeWhenVisible=!1,this.start())}),this.maxDelta=e.maxDelta??1/15,this.timeScale=e.timeScale??1,this.pauseWhenHidden=e.pauseWhenHidden??!0,this.pauseWhenHidden&&typeof document<`u`&&document.addEventListener(`visibilitychange`,this.onVisibilityChange)}get running(){return this.active}get time(){return this.elapsed}start(){this.active||(this.active=!0,this.last=performance.now(),this.handle=requestAnimationFrame(this.loop),this.emit(`start`,void 0))}stop(){this.resumeWhenVisible=!1,this.active&&(this.active=!1,cancelAnimationFrame(this.handle),this.handle=0,this.emit(`stop`,void 0))}dispose(){this.stop(),this.pauseWhenHidden&&typeof document<`u`&&document.removeEventListener(`visibilitychange`,this.onVisibilityChange),this.clear()}},ee=e=>{let t=e.getExtension(`WEBGL_debug_renderer_info`);return{backend:`webgl2`,maxTextureSize:e.getParameter(e.MAX_TEXTURE_SIZE),maxRenderbufferSize:e.getParameter(e.MAX_RENDERBUFFER_SIZE),colorBufferFloat:e.getExtension(`EXT_color_buffer_float`)!==null,colorBufferHalfFloat:e.getExtension(`EXT_color_buffer_half_float`)!==null,vendor:String(t?e.getParameter(t.UNMASKED_VENDOR_WEBGL):e.getParameter(e.VENDOR)),renderer:String(t?e.getParameter(t.UNMASKED_RENDERER_WEBGL):e.getParameter(e.RENDERER))}},te=e=>e.getExtension(`EXT_color_buffer_float`)!==null||e.getExtension(`EXT_color_buffer_half_float`)!==null,ne=`EXT_color_buffer_float or EXT_color_buffer_half_float`,re=()=>{if(typeof document>`u`)return`svg`;try{let e=document.createElement(`canvas`).getContext(`webgl2`);if(!e)return`svg`;let t=te(e);return e.getExtension(`WEBGL_lose_context`)?.loseContext(),t?`webgl2`:`svg`}catch{return`svg`}},p=class extends d{constructor(e={}){super(),n(this,`canvas`),n(this,`gl`),n(this,`capabilities`),n(this,`width`,0),n(this,`height`,0),n(this,`pixelRatio`,1),n(this,`maxPixelRatio`),n(this,`contextLost`,!1),n(this,`disposed`,!1),n(this,`onContextLost`,()=>{this.contextLost=!0,this.emit(`contextlost`,void 0)}),this.canvas=e.canvas??document.createElement(`canvas`),this.maxPixelRatio=e.maxPixelRatio??2;let t=this.canvas.getContext(`webgl2`,{alpha:e.alpha??!0,premultipliedAlpha:e.premultipliedAlpha??!0,antialias:e.antialias??!1,preserveDrawingBuffer:e.preserveDrawingBuffer??!1,depth:!1,stencil:!1,powerPreference:`high-performance`});i(t,`context-unavailable`,`webgl2 is not available on this canvas`),this.gl=t,this.capabilities=ee(t),this.canvas.addEventListener(`webglcontextlost`,this.onContextLost)}get size(){return{width:this.width,height:this.height}}get drawingBufferSize(){return{width:this.canvas.width,height:this.canvas.height}}get ratio(){return this.pixelRatio}get lost(){return this.contextLost||this.gl.isContextLost()}resize(e,t,n=window.devicePixelRatio||1){let r=a(n,1,this.maxPixelRatio),i=this.capabilities.maxTextureSize,o=Math.min(Math.max(1,Math.round(e*r)),i),s=Math.min(Math.max(1,Math.round(t*r)),i);this.width=e,this.height=t,this.pixelRatio=r,(this.canvas.width!==o||this.canvas.height!==s)&&(this.canvas.width=o,this.canvas.height=s,this.emit(`resize`,{width:o,height:s}))}bindDefault(){let{gl:e}=this;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,this.canvas.width,this.canvas.height)}clearTo(e=0,t=0,n=0,r=0){let{gl:i}=this;i.clearColor(e,t,n,r),i.clear(i.COLOR_BUFFER_BIT)}dispose(){this.disposed||(this.disposed=!0,this.canvas.removeEventListener(`webglcontextlost`,this.onContextLost),this.gl.getExtension(`WEBGL_lose_context`)?.loseContext(),this.clear())}},ie=class extends d{constructor(e={}){super(),n(this,`duration`),n(this,`easing`),n(this,`loop`),n(this,`raw`,0),n(this,`direction`,1),n(this,`current`,`idle`),n(this,`active`,!1),n(this,`detach`,null),this.duration=e.duration??1.4,this.easing=u(e.easing??`easeInOutCubic`),this.loop=e.loop??!1}get progress(){return this.raw}get eased(){return this.easing(this.raw)}get state(){return this.current}get running(){return this.active}setEasing(e){this.easing=u(e)}play(){this.direction=1,this.active=!0,this.transitionTo(`melting`)}reverse(){this.direction=-1,this.active=!0,this.transitionTo(`reforming`)}toggle(){this.current===`melting`||this.current===`melted`?this.reverse():this.play()}pause(){this.active=!1}reset(){this.active=!1,this.direction=1,this.raw=0,this.transitionTo(`idle`),this.emitChange()}seek(e){this.raw=o(e),this.emitChange()}advance(e){if(!this.active||this.duration<=0)return;let t=o(this.raw+e/this.duration*this.direction);t!==this.raw&&(this.raw=t,this.emitChange(),this.raw===1&&this.direction===1?this.finish(`melted`):this.raw===0&&this.direction===-1&&this.finish(`idle`))}attach(e){return this.detach?.(),this.detach=e.on(`tick`,e=>this.advance(e.delta)),this.detach}dispose(){this.detach?.(),this.detach=null,this.active=!1,this.clear()}finish(e){this.loop?(this.direction=this.direction===1?-1:1,this.transitionTo(this.direction===1?`melting`:`reforming`)):(this.active=!1,this.transitionTo(e),this.emit(`complete`,e))}transitionTo(e){this.current!==e&&(this.current=e,this.emit(`statechange`,e))}emitChange(){this.emit(`change`,{progress:this.raw,eased:this.easing(this.raw),state:this.current})}},m={duration:1.6,maxPixelRatio:2,maxStepsPerFrame:24,reducedMotionDuration:.05},h={duration:[.05,2**53-1],maxPixelRatio:[.5,8],maxStepsPerFrame:[1,240]},g=[`auto`,`webgl2`,`svg`],_=e=>typeof e==`number`&&Number.isFinite(e)&&e>0,ae=e=>{if(typeof HTMLElement>`u`||!(e.target instanceof HTMLElement))throw new r(`invalid-options`,`target must be an HTMLElement`);if(e.duration!==void 0&&!_(e.duration))throw new r(`invalid-options`,`duration must be a finite number above zero, received ${String(e.duration)}`);if(e.maxPixelRatio!==void 0&&!_(e.maxPixelRatio))throw new r(`invalid-options`,`maxPixelRatio must be a number above zero, received ${String(e.maxPixelRatio)}`);if(e.maxStepsPerFrame!==void 0&&!_(e.maxStepsPerFrame))throw new r(`invalid-options`,`maxStepsPerFrame must be a number above zero, received ${String(e.maxStepsPerFrame)}`);if(e.backend!==void 0&&!g.includes(e.backend))throw new r(`invalid-options`,`backend must be one of ${g.join(`, `)}, received ${String(e.backend)}`)},oe=e=>{let[t,n]=h.maxStepsPerFrame;return Math.round(Math.min(Math.max(e??m.maxStepsPerFrame,t),n))},se=()=>typeof window<`u`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,v=class{constructor(e){n(this,`dynamic`,!1),n(this,`image`,null),n(this,`input`),n(this,`loaded`,!1),this.input=e}get ready(){return this.loaded}get width(){return this.image?.naturalWidth??0}get height(){return this.image?.naturalHeight??0}async load(){if(this.loaded)return;let e=typeof this.input==`string`?new Image:this.input;typeof this.input==`string`&&(e.crossOrigin=`anonymous`,e.src=this.input),(!e.complete||e.naturalWidth===0)&&await new Promise((t,n)=>{let i=()=>{e.removeEventListener(`error`,a),t()},a=()=>{e.removeEventListener(`load`,i),n(new r(`source-unavailable`,`failed to load ${e.src}`))};e.addEventListener(`load`,i,{once:!0}),e.addEventListener(`error`,a,{once:!0})}),i(e.naturalWidth>0,`source-unavailable`,`image has no dimensions: ${e.src}`),this.image=e,this.loaded=!0}frame(){return this.loaded?this.image:null}dispose(){this.image=null,this.loaded=!1}},y=class{constructor(e){n(this,`dynamic`,!0),n(this,`video`),n(this,`owned`),n(this,`loaded`,!1),this.owned=typeof e==`string`,typeof e==`string`?(this.video=document.createElement(`video`),this.video.crossOrigin=`anonymous`,this.video.muted=!0,this.video.loop=!0,this.video.playsInline=!0,this.video.src=e):this.video=e}get ready(){return this.loaded&&this.video.readyState>=2}get width(){return this.video.videoWidth}get height(){return this.video.videoHeight}async load(){if(this.video.readyState<2){let e=this.video.error;if(e)throw new r(`source-unavailable`,`the video element already failed: ${e.message}`);await new Promise((e,t)=>{let n=()=>{this.video.removeEventListener(`error`,i),e()},i=()=>{this.video.removeEventListener(`loadeddata`,n),t(new r(`source-unavailable`,`failed to load video: ${this.video.error?.message??`unknown error`}`))};this.video.addEventListener(`loadeddata`,n,{once:!0}),this.video.addEventListener(`error`,i,{once:!0})})}await this.video.play().catch(()=>{}),this.loaded=!0}frame(){return this.ready?this.video:null}dispose(){this.loaded=!1,this.owned&&(this.video.pause(),this.video.removeAttribute(`src`),this.video.load())}},b=64,x=2,ce=250,le=.1,ue=e=>{if(typeof document>`u`)return null;let t=document.createElement(`canvas`);t.width=b,t.height=b;let n=t.getContext(`2d`,{willReadFrequently:!0});if(!n)return null;let r;try{n.drawImage(e,0,0,b,b),r=n.getImageData(0,0,b,b).data}catch{return null}let i=0;for(let e=3;e<r.length;e+=4)(r[e]??255)<ce&&(i+=1);if(i>r.length/4*.01)return null;let o=[];for(let e=0;e<b;e+=1)for(let t=0;t<b;t+=1){if(t>=x&&e>=x&&t<b-x&&e<b-x)continue;let n=(e*b+t)*4;o.push([(r[n]??0)/255,(r[n+1]??0)/255,(r[n+2]??0)/255])}let s=[0,0,0];for(let[e,t,n]of o)s[0]+=e,s[1]+=t,s[2]+=n;s[0]/=o.length,s[1]/=o.length,s[2]/=o.length;let c=0;for(let[e,t,n]of o)c+=Math.hypot(e-s[0],t-s[1],n-s[2]);return c/=o.length,c>le?null:{colour:s,tolerance:a(c*2.5+.06,.08,.3)}},de=/\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i,fe=e=>typeof e==`object`&&`frame`in e&&typeof e.frame==`function`,pe=e=>{if(typeof e==`string`)return de.test(e)?new y(e):new v(e);if(fe(e))return e;if(e instanceof HTMLImageElement)return new v(e);if(e instanceof HTMLVideoElement)return new y(e);throw new r(`invalid-options`,`source must be an image, a video, a URL, or a GraphicsSource`)},S={wax:{viscosity:.02,density:.9,tension:.5,meltRate:1,cooling:.35,yield:.08,gloss:.35,fresnel:.3,refraction:.01,blend:.2,translucency:.2,absorption:[.1,.1,.1],tint:[1,1,1,1]},honey:{viscosity:2.5,density:1.4,tension:.7,meltRate:1.2,cooling:0,yield:0,gloss:.85,fresnel:.5,refraction:.03,blend:.65,translucency:.6,absorption:[.05,.4,1.1],tint:[1,.72,.25,1]},chocolate:{viscosity:1.5,density:1.2,tension:.45,meltRate:.9,cooling:.15,yield:.35,gloss:.6,fresnel:.25,refraction:.005,blend:.9,translucency:.1,absorption:[.5,.9,1.3],tint:[.36,.2,.1,1]},tar:{viscosity:12,density:1.3,tension:.3,meltRate:.6,cooling:0,yield:.25,gloss:.95,fresnel:.7,refraction:0,blend:1,translucency:0,absorption:[2,2,2],tint:[.05,.05,.05,1]},solder:{viscosity:.005,density:3,tension:1,meltRate:2.5,cooling:1.2,yield:0,gloss:1,fresnel:.9,refraction:0,blend:.85,translucency:0,absorption:[.15,.15,.15],tint:[.78,.8,.85,1]},slime:{viscosity:.4,density:.8,tension:.85,meltRate:1.5,cooling:0,yield:.12,gloss:.7,fresnel:.4,refraction:.04,blend:.7,translucency:.5,absorption:[.9,.1,.9],tint:[.45,1,.3,1]}},C={viscosity:[.001,50],density:[.1,4],tension:[0,1],meltRate:[.05,6],cooling:[0,3],yield:[0,1],gloss:[0,1],fresnel:[0,1],refraction:[0,.08],blend:[0,1],translucency:[0,1]},w=(e=`wax`)=>{if(typeof e==`string`)return{...S[e]};let{base:t,...n}=e,r={...S[t??`wax`],...n};return{...r,viscosity:a(r.viscosity,...C.viscosity),density:a(r.density,...C.density),tension:a(r.tension,...C.tension),meltRate:a(r.meltRate,...C.meltRate),cooling:a(r.cooling,...C.cooling),yield:a(r.yield,...C.yield),gloss:a(r.gloss,...C.gloss),fresnel:a(r.fresnel,...C.fresnel),refraction:a(r.refraction,...C.refraction),blend:a(r.blend,...C.blend),translucency:a(r.translucency,...C.translucency)}},T={material:`wax`,layerDelay:.35,ground:`open`,simulationScale:.4,substeps:2,viscosityIterations:16,pressureIterations:24,pressureSolver:`multigrid`,pressureCycles:2,stepDuration:1/60,snapshotEvery:12,maxKeyframes:48,gravity:1,drag:1,meltPoint:.5,conduction:4,heatTop:1.2,coreHeat:.1,surfaceHeat:2,surfaceDepth:5,columnFeed:.5,onsetSpread:.6,noiseScale:4,freezePoint:.45,solidViscosity:40,curvatureFlow:.1,volumeGuard:.15,rim:6,edgeWidth:.6,dripRoom:.6,topRoom:.08,sideRoom:.15,seed:11,light:[-.35,.6,1]},E={layerDelay:[0,5],simulationScale:[.125,1],substeps:[1,6],viscosityIterations:[2,64],pressureIterations:[2,96],pressureCycles:[1,6],stepDuration:[1/240,1/15],snapshotEvery:[1,120],maxKeyframes:[4,512],gravity:[0,4],drag:[0,10],meltPoint:[.2,.8],conduction:[0,16],heatTop:[0,3],coreHeat:[0,4],surfaceHeat:[0,6],surfaceDepth:[1,20],columnFeed:[0,1],onsetSpread:[0,1],noiseScale:[.5,16],freezePoint:[0,.8],solidViscosity:[5,400],curvatureFlow:[0,.5],volumeGuard:[0,.5],rim:[0,32],edgeWidth:[.2,2],dripRoom:[0,2],topRoom:[0,1],sideRoom:[0,1]},D=e=>{let t={};for(let n of Object.keys(e)){let r=e[n];r!==void 0&&(t[n]=r)}return t},O=(e,t)=>{let[n,r]=E[t],i=T[t];return a(Number.isFinite(e)?e:i,n,r)},k=(e,t)=>Math.round(O(e,t)),A=e=>{let[t,n,r]=e,i=Math.hypot(t,n,r);return[t/i,n/i,r/i]},me=e=>{if(Array.isArray(e)&&e.length===3){let[t,n,r]=e.map(e=>Number(e)),i=Math.hypot(t,n,r);if(Number.isFinite(i)&&i>1e-6)return A([t,n,r])}return A(T.light)},he=(e,t)=>e.map((e,n)=>({material:w(e.material),delay:Math.max(0,Number.isFinite(e.delay??NaN)?e.delay:n*t)})),j=(e={})=>{let t={...T,...D(e)},n=O(t.layerDelay,`layerDelay`);return{layers:he(t.layers&&t.layers.length>0?t.layers:[{material:t.material}],n),layerDelay:n,ground:t.ground===`floor`?`floor`:`open`,simulationScale:O(t.simulationScale,`simulationScale`),substeps:k(t.substeps,`substeps`),viscosityIterations:k(t.viscosityIterations,`viscosityIterations`),pressureIterations:k(t.pressureIterations,`pressureIterations`),pressureSolver:t.pressureSolver===`jacobi`?`jacobi`:`multigrid`,pressureCycles:k(t.pressureCycles,`pressureCycles`),stepDuration:O(t.stepDuration,`stepDuration`),snapshotEvery:k(t.snapshotEvery,`snapshotEvery`),maxKeyframes:k(t.maxKeyframes,`maxKeyframes`),gravity:O(t.gravity,`gravity`),drag:O(t.drag,`drag`),meltPoint:O(t.meltPoint,`meltPoint`),conduction:O(t.conduction,`conduction`),heatTop:O(t.heatTop,`heatTop`),coreHeat:O(t.coreHeat,`coreHeat`),surfaceHeat:O(t.surfaceHeat,`surfaceHeat`),surfaceDepth:O(t.surfaceDepth,`surfaceDepth`),columnFeed:O(t.columnFeed,`columnFeed`),onsetSpread:O(t.onsetSpread,`onsetSpread`),noiseScale:O(t.noiseScale,`noiseScale`),freezePoint:O(t.freezePoint,`freezePoint`),solidViscosity:O(t.solidViscosity,`solidViscosity`),curvatureFlow:O(t.curvatureFlow,`curvatureFlow`),volumeGuard:O(t.volumeGuard,`volumeGuard`),rim:O(t.rim,`rim`),edgeWidth:O(t.edgeWidth,`edgeWidth`),dripRoom:O(t.dripRoom,`dripRoom`),topRoom:O(t.topRoom,`topRoom`),sideRoom:O(t.sideRoom,`sideRoom`),seed:Number.isFinite(t.seed)?t.seed:T.seed,light:me(t.light)}},ge=e=>{let{layers:t,...n}=e;return{...n,layers:t.map(e=>({material:e.material,delay:e.delay}))}},_e=(e,t)=>{let{material:n,layers:r,...i}=D(t),a={...ge(e),...i};if(r&&r.length>0)return j({...a,layers:r});if(n===void 0)return j(a);let o=e.layers.map((e,t)=>({material:t===0?n:e.material,delay:e.delay}));return j({...a,layers:o})},ve={hash:`
vec3 meltPermute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float meltHash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float meltHash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
`,simplex:`
float meltSimplex(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = meltPermute(meltPermute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`,fbm:`
float meltFbm(vec2 p, int octaves, float lacunarity, float gain) {
  float amplitude = 0.5;
  float total = 0.0;
  float normalisation = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    total += amplitude * meltSimplex(p);
    normalisation += amplitude;
    p *= lacunarity;
    amplitude *= gain;
  }
  return normalisation > 0.0 ? total / normalisation : 0.0;
}

float meltRidged(vec2 p, int octaves, float lacunarity, float gain) {
  float amplitude = 0.5;
  float total = 0.0;
  float normalisation = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    total += amplitude * (1.0 - abs(meltSimplex(p)));
    normalisation += amplitude;
    p *= lacunarity;
    amplitude *= gain;
  }
  return normalisation > 0.0 ? total / normalisation : 0.0;
}
`},ye=((...e)=>e.map(e=>ve[e]).join(`
`))(`hash`,`simplex`,`fbm`),M=(e,t)=>`const float ${e} = ${t.toFixed(6)};`,N=(e,t)=>`const int ${e} = ${Math.round(t)};`,P=[M(`INITIAL_SLOPE`,3),M(`FAR_FIELD`,24),M(`CURVATURE_BAND_INNER`,2),M(`CURVATURE_BAND_OUTER`,4),M(`HEAT_BAND_START`,.2),M(`MAX_TEMPERATURE`,1.5),M(`LIQUID_BAND`,.1),M(`MELT_BAND`,.2),M(`SHADE_WET_BAND`,.15),M(`SURFACE_BAND_OUTER`,.5),M(`GRAVITY_BAND`,2),M(`TENSION_BAND`,1.5),M(`FREEZE_ONSET`,.25),M(`PAPANASTASIOU_EXPONENT`,50),M(`AIR_VELOCITY_DECAY`,.9),M(`CFL_LIMIT`,.5),M(`WALL_DISTANCE`,1),M(`FLOOR_SOFT`,10),N(`ONSET_OCTAVES`,3),N(`COLUMN_OCTAVES`,2),M(`COLUMN_FREQUENCY`,2),M(`SEED_DECORRELATION`,.37),M(`NORMAL_FLATNESS`,.25),M(`HELD_BAND_INNER`,.9),M(`HELD_BAND_OUTER`,2),M(`STRETCH_ALPHA_INNER`,.005),M(`STRETCH_ALPHA_OUTER`,.05),M(`THICKNESS_PER_RIM`,2),M(`COVERAGE_CUTOFF`,.003),M(`AMBIENT`,.8),M(`SPECULAR_POWER_MIN`,10),M(`SPECULAR_POWER_MAX`,260),M(`FRESNEL_POWER`,3),M(`SKY_FLOOR`,.2),M(`REFLECTION_STRENGTH`,.7),M(`TRANSLUCENCY_STRENGTH`,.6)].join(`
`),F=`#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 vUv;
out vec4 outField;

uniform sampler2D uA;
uniform sampler2D uB;
uniform vec2 uTexel;
uniform float uDt;
uniform float uTime;
uniform float uFloor;
uniform float uFloorLevel;
${P}

bool wallLeft(vec2 uv) { return uv.x < uTexel.x; }
bool wallRight(vec2 uv) { return uv.x > 1.0 - uTexel.x; }
bool wallBottom(vec2 uv) { return uFloor > 0.5 && uv.y < uFloorLevel; }
`,I=`
float phiAt(vec2 uv) {
  return texture(uA, uv).z;
}

vec2 gradientAt(vec2 uv) {
  return vec2(
    phiAt(uv + vec2(uTexel.x, 0.0)) - phiAt(uv - vec2(uTexel.x, 0.0)),
    phiAt(uv + vec2(0.0, uTexel.y)) - phiAt(uv - vec2(0.0, uTexel.y))
  ) * 0.5;
}

float curvatureAt(vec2 uv) {
  vec2 t = uTexel;
  float pC = phiAt(uv);
  float pE = phiAt(uv + vec2(t.x, 0.0));
  float pW = phiAt(uv - vec2(t.x, 0.0));
  float pN = phiAt(uv + vec2(0.0, t.y));
  float pS = phiAt(uv - vec2(0.0, t.y));
  float pNE = phiAt(uv + t);
  float pNW = phiAt(uv + vec2(-t.x, t.y));
  float pSE = phiAt(uv + vec2(t.x, -t.y));
  float pSW = phiAt(uv - t);
  float px = (pE - pW) * 0.5;
  float py = (pN - pS) * 0.5;
  float pxx = pE - 2.0 * pC + pW;
  float pyy = pN - 2.0 * pC + pS;
  float pxy = (pNE - pNW - pSE + pSW) * 0.25;
  float g2 = px * px + py * py;
  float kappa = (pxx * py * py - 2.0 * px * py * pxy + pyy * px * px) / max(pow(g2, 1.5), 1e-4);
  return clamp(kappa, -1.0, 1.0);
}
`,be=`${F}
uniform sampler2D uOrigin;

void main() {
  float alpha = texture(uOrigin, vUv).a;
  float phi = (0.5 - alpha) * INITIAL_SLOPE;
  outField = vec4(0.0, 0.0, phi, 0.0);
}
`,xe=`${F}
void main() {
  outField = vec4(vUv, 0.0, 0.0);
}
`,Se=`${F}
${I}
uniform sampler2D uRhs;
uniform sampler2D uVolume;
uniform sampler2D uVolumeReference;
uniform float uTensionFlow;
uniform float uVolumeGuard;
uniform float uMeltPoint;

void main() {
  vec2 t = uTexel;
  vec4 c = texture(uA, vUv);
  float pC = c.z;
  float pE = phiAt(vUv + vec2(t.x, 0.0));
  float pW = phiAt(vUv - vec2(t.x, 0.0));
  float pN = phiAt(vUv + vec2(0.0, t.y));
  float pS = phiAt(vUv - vec2(0.0, t.y));

  float p0 = texture(uRhs, vUv).z;
  float p0E = texture(uRhs, vUv + vec2(t.x, 0.0)).z;
  float p0W = texture(uRhs, vUv - vec2(t.x, 0.0)).z;
  float p0N = texture(uRhs, vUv + vec2(0.0, t.y)).z;
  float p0S = texture(uRhs, vUv - vec2(0.0, t.y)).z;
  bool onInterface = p0 * p0E < 0.0 || p0 * p0W < 0.0 || p0 * p0N < 0.0 || p0 * p0S < 0.0;

  float s = p0 / sqrt(p0 * p0 + 1.0);
  float phi;
  if (onInterface) {
    float dx = max(max(abs(p0E - p0W) * 0.5, abs(p0E - p0)), max(abs(p0 - p0W), 1e-3));
    float dy = max(max(abs(p0N - p0S) * 0.5, abs(p0N - p0)), max(abs(p0 - p0S), 1e-3));
    float distance = p0 / max(dx, dy);
    float sign0 = p0 >= 0.0 ? 1.0 : -1.0;
    phi = pC - 0.5 * (sign0 * abs(pC) - distance);
  } else {
    float a = pC - pW;
    float b = pE - pC;
    float cc = pC - pS;
    float d = pN - pC;
    float ap = max(a, 0.0);
    float am = min(a, 0.0);
    float bp = max(b, 0.0);
    float bm = min(b, 0.0);
    float cp = max(cc, 0.0);
    float cm = min(cc, 0.0);
    float dp = max(d, 0.0);
    float dm = min(d, 0.0);
    float grad = s > 0.0
      ? sqrt(max(ap * ap, bm * bm) + max(cp * cp, dm * dm))
      : sqrt(max(am * am, bp * bp) + max(cm * cm, dp * dp));
    phi = pC - 0.5 * s * (grad - 1.0);
  }

  float wet = smoothstep(uMeltPoint - MELT_BAND, uMeltPoint, c.w);
  float kappa = curvatureAt(vUv);
  float edgeBand = (1.0 - smoothstep(CURVATURE_BAND_INNER, CURVATURE_BAND_OUTER, abs(pC))) * wet;
  phi += uTensionFlow * kappa * edgeBand;
  float volume = texture(uVolume, vec2(0.5)).x;
  float reference = texture(uVolumeReference, vec2(0.5)).x;
  float excess = max(0.0, volume - reference) / max(reference, 1e-5);
  phi += uVolumeGuard * excess * edgeBand;
  phi = clamp(phi, -FAR_FIELD, FAR_FIELD);

  outField = vec4(c.xy, phi, c.w);
}
`,Ce=`${F}
${I}
${ye}
uniform float uGravity;
uniform float uDrag;
uniform float uSigma;
uniform float uMeltRate;
uniform float uMeltPoint;
uniform float uConduction;
uniform float uCooling;
uniform float uHeatTop;
uniform float uCoreHeat;
uniform float uSurfaceHeat;
uniform float uSurfaceDepth;
uniform float uColumnFeed;
uniform float uOnsetSpread;
uniform float uNoiseScale;
uniform float uFreezePoint;
uniform float uSeed;
uniform float uDelay;

void main() {
  vec2 t = uTexel;
  vec4 here = texture(uA, vUv);
  vec2 back = vUv - here.xy * uDt * t;
  vec4 a = texture(uA, back);
  vec2 u = a.xy;
  float phi = a.z;
  float T = a.w;

  float phiC = here.z;
  float TL = texture(uA, vUv - vec2(t.x, 0.0)).w;
  float TR = texture(uA, vUv + vec2(t.x, 0.0)).w;
  float TN = texture(uA, vUv + vec2(0.0, t.y)).w;
  float TS = texture(uA, vUv - vec2(0.0, t.y)).w;

  float inside = 1.0 - smoothstep(0.0, 1.0, phiC);
  float surface = smoothstep(-uSurfaceDepth, SURFACE_BAND_OUTER, phiC);
  float exposure = uCoreHeat + uSurfaceHeat * surface;

  float noise = meltFbm(vUv * uNoiseScale + uSeed, ONSET_OCTAVES, 2.0, 0.5);
  float delay = (noise * 0.5 + 0.5) * uOnsetSpread;
  float column = meltFbm(vec2(vUv.x * uNoiseScale * COLUMN_FREQUENCY, uSeed * SEED_DECORRELATION), COLUMN_OCTAVES, 2.0, 0.5);
  float feed = 1.0 + uColumnFeed * column;
  float top = 1.0 + uHeatTop * smoothstep(HEAT_BAND_START, 1.0, vUv.y);
  float started = step(uDelay, uTime);
  float heating = uMeltRate * feed * top * exposure * max(0.0, 1.0 - delay) * started;

  float lapT = TL + TR + TN + TS - 4.0 * here.w;
  T += (heating + uConduction * lapT) * uDt * inside;
  if (phiC > 0.0) T = max(T, max(max(TL, TR), max(TN, TS)));
  float liquid = smoothstep(uMeltPoint, uMeltPoint + LIQUID_BAND, T);
  T -= uCooling * uDt * liquid * surface;
  T = clamp(T, 0.0, MAX_TEMPERATURE);

  float band = 1.0 - smoothstep(0.0, GRAVITY_BAND, phi);
  u.y -= uGravity * uDt * band;
  u /= 1.0 + uDrag * uDt;
  if (uFloor > 0.5 && u.y < 0.0) u.y *= smoothstep(uFloorLevel, uFloorLevel + FLOOR_SOFT * t.y, vUv.y);

  float kappa = curvatureAt(vUv);
  vec2 grad = gradientAt(vUv);
  vec2 normal = grad / max(length(grad), 1e-4);
  float delta = max(0.0, 1.0 - abs(phiC) / TENSION_BAND) / TENSION_BAND;
  u -= uSigma * kappa * normal * delta * uDt;

  float freeze = uFreezePoint > 0.0 ? smoothstep(uFreezePoint * FREEZE_ONSET, uFreezePoint, T) : 1.0;
  u *= freeze;

  float limit = CFL_LIMIT / uDt;
  float speed = length(u);
  if (speed > limit) u *= limit / speed;

  if (wallLeft(vUv) || wallRight(vUv)) u.x = 0.0;
  if (wallBottom(vUv)) {
    u = vec2(0.0);
    phi = max(phi, WALL_DISTANCE);
  }

  outField = vec4(u, phi, T);
}
`,we=`${F}
uniform int uCount;

void main() {
  float total = 0.0;
  for (int i = 0; i < uCount; i++) {
    float phi = texture(uA, vec2((float(i) + 0.5) * uTexel.x, vUv.y)).z;
    total += 1.0 - smoothstep(-0.5, 0.5, phi);
  }
  outField = vec4(total / float(uCount), 0.0, 0.0, 0.0);
}
`,Te=`${F}
uniform sampler2D uRows;
uniform int uCount;

void main() {
  float total = 0.0;
  for (int i = 0; i < uCount; i++) {
    total += texture(uRows, vec2(0.5, (float(i) + 0.5) * uTexel.y)).x;
  }
  outField = vec4(total / float(uCount), 0.0, 0.0, 0.0);
}
`,Ee=`${F}
void main() {
  vec2 velocity = texture(uA, vUv).xy;
  vec2 back = vUv - velocity * uDt * uTexel;
  outField = texture(uB, back);
}
`,De=`${F}
uniform sampler2D uRhs;
uniform float uNuSolid;
uniform float uNuLiquid;
uniform float uMeltPoint;
uniform float uYield;

float nuOf(float T) {
  float s = smoothstep(uMeltPoint - MELT_BAND, uMeltPoint + MELT_BAND, T);
  return exp(mix(log(uNuSolid), log(uNuLiquid), s));
}

float faceOf(float own, vec4 neighbour, bool wall) {
  if (wall) return own;
  return neighbour.z > 0.0 ? 0.0 : 0.5 * (own + nuOf(neighbour.w));
}

void main() {
  vec2 t = uTexel;
  vec4 c = texture(uA, vUv);
  if (c.z > 0.0) {
    outField = c;
    return;
  }
  vec4 rhs = texture(uRhs, vUv);
  vec4 E = texture(uA, vUv + vec2(t.x, 0.0));
  vec4 W = texture(uA, vUv - vec2(t.x, 0.0));
  vec4 N = texture(uA, vUv + vec2(0.0, t.y));
  vec4 S = texture(uA, vUv - vec2(0.0, t.y));
  vec4 NE = texture(uA, vUv + t);
  vec4 NW = texture(uA, vUv + vec2(-t.x, t.y));
  vec4 SE = texture(uA, vUv + vec2(t.x, -t.y));
  vec4 SW = texture(uA, vUv - t);

  float dudx = (E.x - W.x) * 0.5;
  float dvdy = (N.y - S.y) * 0.5;
  float dudy = (N.x - S.x) * 0.5;
  float dvdx = (E.y - W.y) * 0.5;
  float rate = sqrt(2.0 * dudx * dudx + 2.0 * dvdy * dvdy + (dudy + dvdx) * (dudy + dvdx));
  float wet = smoothstep(uMeltPoint - MELT_BAND, uMeltPoint + MELT_BAND, c.w);
  float nuYield = uYield * wet * (1.0 - exp(-rate * PAPANASTASIOU_EXPONENT)) / max(rate, 1e-3);

  float nC = nuOf(c.w) + nuYield;
  float ne = faceOf(nC, E, false);
  float nw = faceOf(nC, W, false);
  float nn = faceOf(nC, N, false);
  float ns = faceOf(nC, S, wallBottom(vUv - vec2(0.0, t.y)));

  float dvdxN = 0.25 * (NE.y + E.y - NW.y - W.y);
  float dvdxS = 0.25 * (SE.y + E.y - SW.y - W.y);
  float dudyE = 0.25 * (NE.x + N.x - SE.x - S.x);
  float dudyW = 0.25 * (NW.x + N.x - SW.x - S.x);

  float k = uDt;
  float diagU = 1.0 + k * (2.0 * ne + 2.0 * nw + nn + ns);
  float offU = k * (2.0 * ne * E.x + 2.0 * nw * W.x + nn * N.x + ns * S.x + nn * dvdxN - ns * dvdxS);
  float diagV = 1.0 + k * (2.0 * nn + 2.0 * ns + ne + nw);
  float offV = k * (2.0 * nn * N.y + 2.0 * ns * S.y + ne * E.y + nw * W.y + ne * dudyE - nw * dudyW);

  vec2 u = vec2((rhs.x + offU) / diagU, (rhs.y + offV) / diagV);
  outField = vec4(u, c.z, c.w);
}
`,Oe=`${F}
${I}
void main() {
  vec2 t = uTexel;
  vec4 c = texture(uA, vUv);
  if (c.z > 0.0) {
    outField = vec4(0.0, c.z, 0.0, 0.0);
    return;
  }
  vec2 E = texture(uA, vUv + vec2(t.x, 0.0)).xy;
  vec2 W = texture(uA, vUv - vec2(t.x, 0.0)).xy;
  vec2 N = texture(uA, vUv + vec2(0.0, t.y)).xy;
  vec2 S = texture(uA, vUv - vec2(0.0, t.y)).xy;
  if (wallRight(vUv)) E.x = 0.0;
  if (wallLeft(vUv)) W.x = 0.0;
  if (wallBottom(vUv - vec2(0.0, t.y))) S.y = 0.0;
  float div = 0.5 * (E.x - W.x + N.y - S.y);
  outField = vec4(div, c.z, 0.0, 0.0);
}
`,L=`
uniform sampler2D uPressure;
uniform sampler2D uDivergence;

float maskAt(vec2 uv) {
  return texture(uDivergence, uv).y;
}

float pressureAt(vec2 uv, float own) {
  if (uv.x < 0.0 || uv.x > 1.0 || wallBottom(uv)) return own;
  if (maskAt(uv) > 0.0) return 0.0;
  return texture(uPressure, uv).x;
}
`,ke=`${F}
${L}
void main() {
  vec2 t = uTexel;
  vec2 rhs = texture(uDivergence, vUv).xy;
  if (rhs.y > 0.0) {
    outField = vec4(0.0);
    return;
  }
  float own = texture(uPressure, vUv).x;
  float pE = pressureAt(vUv + vec2(t.x, 0.0), own);
  float pW = pressureAt(vUv - vec2(t.x, 0.0), own);
  float pN = pressureAt(vUv + vec2(0.0, t.y), own);
  float pS = pressureAt(vUv - vec2(0.0, t.y), own);
  float p = 0.25 * (pE + pW + pN + pS - rhs.x);
  outField = vec4(p, 0.0, 0.0, 0.0);
}
`,Ae=`${F}
${L}
void main() {
  vec2 t = uTexel;
  vec2 rhs = texture(uDivergence, vUv).xy;
  if (rhs.y > 0.0) {
    outField = vec4(0.0);
    return;
  }
  float own = texture(uPressure, vUv).x;
  float pE = pressureAt(vUv + vec2(t.x, 0.0), own);
  float pW = pressureAt(vUv - vec2(t.x, 0.0), own);
  float pN = pressureAt(vUv + vec2(0.0, t.y), own);
  float pS = pressureAt(vUv - vec2(0.0, t.y), own);
  float residual = rhs.x - (pE + pW + pN + pS - 4.0 * own);
  outField = vec4(residual, 0.0, 0.0, 0.0);
}
`,je=`${F}
uniform sampler2D uResidual;
uniform sampler2D uFineRhs;

void main() {
  float residual = texture(uResidual, vUv).x;
  float mask = texture(uFineRhs, vUv).y;
  outField = vec4(residual * 4.0, mask, 0.0, 0.0);
}
`,Me=`${F}
uniform sampler2D uPressure;
uniform sampler2D uCoarse;
uniform sampler2D uDivergence;

void main() {
  float mask = texture(uDivergence, vUv).y;
  if (mask > 0.0) {
    outField = vec4(0.0);
    return;
  }
  float p = texture(uPressure, vUv).x + texture(uCoarse, vUv).x;
  outField = vec4(p, 0.0, 0.0, 0.0);
}
`,Ne=`${F}
${I}
uniform sampler2D uPressure;

float pressureAt(vec2 uv, float own) {
  if (uv.x < 0.0 || uv.x > 1.0 || wallBottom(uv)) return own;
  if (phiAt(uv) > 0.0) return 0.0;
  return texture(uPressure, uv).x;
}

vec2 projected(vec2 uv) {
  vec2 t = uTexel;
  vec4 c = texture(uA, uv);
  float own = texture(uPressure, uv).x;
  float pE = pressureAt(uv + vec2(t.x, 0.0), own);
  float pW = pressureAt(uv - vec2(t.x, 0.0), own);
  float pN = pressureAt(uv + vec2(0.0, t.y), own);
  float pS = pressureAt(uv - vec2(0.0, t.y), own);
  return c.xy - 0.5 * vec2(pE - pW, pN - pS);
}

void main() {
  vec2 t = uTexel;
  vec4 c = texture(uA, vUv);
  vec2 u;
  if (c.z <= 0.0) {
    u = projected(vUv);
  } else {
    vec2 sum = vec2(0.0);
    float count = 0.0;
    vec2 offsets[4] = vec2[4](vec2(t.x, 0.0), vec2(-t.x, 0.0), vec2(0.0, t.y), vec2(0.0, -t.y));
    for (int i = 0; i < 4; i++) {
      vec2 uv = vUv + offsets[i];
      if (phiAt(uv) <= 0.0) {
        sum += projected(uv);
        count += 1.0;
      }
    }
    u = count > 0.0 ? sum / count : c.xy * AIR_VELOCITY_DECAY;
  }
  float limit = CFL_LIMIT / uDt;
  float speed = length(u);
  if (speed > limit) u *= limit / speed;
  if (wallLeft(vUv) || wallRight(vUv)) u.x = 0.0;
  if (wallBottom(vUv)) u = vec2(0.0);
  outField = vec4(u, c.z, c.w);
}
`,Pe=`#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uA;
uniform sampler2D uB;
uniform sampler2D uOrigin;
uniform vec2 uTexel;
uniform float uMeltPoint;
uniform float uRim;
uniform float uEdgeWidth;
uniform float uGloss;
uniform float uFresnel;
uniform float uRefraction;
uniform float uBlend;
uniform float uTranslucency;
uniform vec3 uAbsorption;
uniform vec3 uLight;
uniform vec4 uTint;
${P}

void main() {
  vec4 a = texture(uA, vUv);
  float phi = a.z;
  float T = a.w;
  float inside = 1.0 - smoothstep(-uEdgeWidth, uEdgeWidth, phi);
  float wet = smoothstep(uMeltPoint - SHADE_WET_BAND, uMeltPoint + SHADE_WET_BAND, T);

  vec2 t = uTexel;
  float pE = texture(uA, vUv + vec2(t.x, 0.0)).z;
  float pW = texture(uA, vUv - vec2(t.x, 0.0)).z;
  float pN = texture(uA, vUv + vec2(0.0, t.y)).z;
  float pS = texture(uA, vUv - vec2(0.0, t.y)).z;
  vec2 grad = vec2(pE - pW, pN - pS) * 0.5;
  vec2 outward = grad / max(length(grad), 1e-4);
  float depth = clamp(-phi / uRim, 0.0, 1.0);
  vec3 n = normalize(vec3(outward * (1.0 - depth), NORMAL_FLATNESS + depth));

  vec2 ref = texture(uB, vUv + n.xy * uRefraction * wet).xy;
  vec4 pic = texture(uOrigin, clamp(ref, 0.0, 1.0));
  float picAlpha = pic.a;
  float held = 1.0 - smoothstep(HELD_BAND_INNER, HELD_BAND_OUTER, phi);
  float coverage = mix(picAlpha * held, inside, wet);
  if (coverage < COVERAGE_CUTOFF) {
    fragColor = vec4(0.0);
    return;
  }
  vec3 picColour = pic.rgb / max(picAlpha, 1e-4);
  float stretched = 1.0 - smoothstep(STRETCH_ALPHA_INNER, STRETCH_ALPHA_OUTER, picAlpha);
  vec3 base = mix(picColour, uTint.rgb, max(uBlend * wet, stretched));
  float thickness = depth * THICKNESS_PER_RIM;
  base *= exp(-uAbsorption * thickness * wet);

  vec3 L = normalize(uLight);
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  float facing = max(dot(n, V), 0.0);
  float diffuse = AMBIENT + (1.0 - AMBIENT) * max(dot(n, L), 0.0);
  float spec = pow(max(dot(n, H), 0.0), mix(SPECULAR_POWER_MIN, SPECULAR_POWER_MAX, uGloss)) * uGloss * wet;
  float rim = pow(1.0 - facing, FRESNEL_POWER) * uFresnel * wet;
  float sky = 0.5 + 0.5 * n.y;
  vec3 reflection = mix(vec3(SKY_FLOOR), vec3(1.0), sky) * rim;
  vec3 colour = base * diffuse + vec3(spec) + reflection * REFLECTION_STRENGTH;

  float alpha = coverage * uTint.a * (1.0 - uTranslucency * wet * TRANSLUCENCY_STRENGTH * (1.0 - depth));
  fragColor = vec4(colour * alpha, alpha);
}
`,Fe=`#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 vUv;
out vec4 outField;

uniform sampler2D uSource;
uniform vec4 uRect;
uniform vec3 uKey;
uniform float uKeyTolerance;
uniform float uKeyEnabled;

void main() {
  vec2 local = (vUv - uRect.xy) / uRect.zw;
  float inside = step(0.0, local.x) * step(local.x, 1.0) * step(0.0, local.y) * step(local.y, 1.0);
  vec4 colour = texture(uSource, clamp(local, 0.0, 1.0)) * inside;
  vec3 straight = colour.rgb / max(colour.a, 1e-4);
  float keep = smoothstep(uKeyTolerance, uKeyTolerance * 2.0 + 0.02, distance(straight, uKey));
  colour *= mix(1.0, keep, uKeyEnabled);
  outField = colour;
}
`,R=(e,t,n)=>{let r=e.createShader(t);if(i(r,`context-unavailable`,`failed to allocate a shader`),e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let n=e.getShaderInfoLog(r)??`unknown error`;e.deleteShader(r),i(!1,`shader-compile`,`${t===e.VERTEX_SHADER?`vertex`:`fragment`} shader failed to compile: ${n}`)}return r},z=class{constructor(e,t,r){n(this,`handle`),n(this,`gl`),n(this,`uniforms`,new Map),n(this,`unit`,0),this.gl=e;let a=e.createProgram();i(a,`context-unavailable`,`failed to allocate a program`);let o=R(e,e.VERTEX_SHADER,t),s=R(e,e.FRAGMENT_SHADER,r);if(e.attachShader(a,o),e.attachShader(a,s),e.linkProgram(a),e.deleteShader(o),e.deleteShader(s),!e.getProgramParameter(a,e.LINK_STATUS)){let t=e.getProgramInfoLog(a)??`unknown error`;e.deleteProgram(a),i(!1,`program-link`,`program failed to link: ${t}`)}this.handle=a;let c=e.getProgramParameter(a,e.ACTIVE_UNIFORMS);for(let t=0;t<c;t+=1){let n=e.getActiveUniform(a,t);if(!n)continue;let r=n.name.replace(/\[0\]$/,``),i=e.getUniformLocation(a,r);i&&this.uniforms.set(r,{location:i,type:n.type})}}use(){this.gl.useProgram(this.handle),this.unit=0}set(e,t){let n=this.uniforms.get(e);if(!n)return;let{gl:r}=this,{location:i,type:a}=n;if(typeof t==`boolean`){r.uniform1i(i,+!!t);return}if(typeof t==`number`){a===r.INT||a===r.BOOL?r.uniform1i(i,t):r.uniform1f(i,t);return}let o=t instanceof Float32Array?t:new Float32Array(Array.from(t));switch(a){case r.FLOAT_VEC2:r.uniform2fv(i,o);break;case r.FLOAT_VEC3:r.uniform3fv(i,o);break;case r.FLOAT_VEC4:r.uniform4fv(i,o);break;case r.FLOAT_MAT3:r.uniformMatrix3fv(i,!1,o);break;case r.FLOAT_MAT4:r.uniformMatrix4fv(i,!1,o);break;default:r.uniform1fv(i,o)}}setTexture(e,t){let n=this.uniforms.get(e);if(!n)return;let{gl:r}=this,i=this.unit;this.unit+=1,r.activeTexture(r.TEXTURE0+i),r.bindTexture(r.TEXTURE_2D,t),r.uniform1i(n.location,i)}dispose(){this.gl.deleteProgram(this.handle),this.uniforms.clear()}},B=class{constructor(e,t={}){n(this,`gl`),n(this,`internalFormat`),n(this,`format`),n(this,`type`),n(this,`filter`),n(this,`wrap`),n(this,`flipY`),n(this,`premultiply`),n(this,`current`),n(this,`currentWidth`),n(this,`currentHeight`),this.gl=e,this.internalFormat=t.internalFormat??e.RGBA8,this.format=t.format??e.RGBA,this.type=t.type??e.UNSIGNED_BYTE,this.filter=t.filter??e.LINEAR,this.wrap=t.wrap??e.CLAMP_TO_EDGE,this.flipY=t.flipY??!1,this.premultiply=t.premultiply??!1,this.currentWidth=Math.max(1,t.width??1),this.currentHeight=Math.max(1,t.height??1),this.current=this.allocate(this.currentWidth,this.currentHeight)}get handle(){return this.current}get width(){return this.currentWidth}get height(){return this.currentHeight}resize(e,t){let n=Math.max(1,e),r=Math.max(1,t);n===this.currentWidth&&r===this.currentHeight||(this.gl.deleteTexture(this.current),this.currentWidth=n,this.currentHeight=r,this.current=this.allocate(n,r))}upload(e,t,n){let{gl:r}=this;this.resize(t,n),r.bindTexture(r.TEXTURE_2D,this.current),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,this.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,this.premultiply),r.texSubImage2D(r.TEXTURE_2D,0,0,0,t,n,this.format,this.type,e),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),r.bindTexture(r.TEXTURE_2D,null)}uploadData(e,t,n){let{gl:r}=this;this.resize(t,n),r.bindTexture(r.TEXTURE_2D,this.current),r.texSubImage2D(r.TEXTURE_2D,0,0,0,t,n,this.format,this.type,e),r.bindTexture(r.TEXTURE_2D,null)}dispose(){this.gl.deleteTexture(this.current)}allocate(e,t){let{gl:n}=this,r=n.createTexture();return i(r,`context-unavailable`,`failed to allocate a texture`),n.bindTexture(n.TEXTURE_2D,r),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,this.filter),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,this.filter),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,this.wrap),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,this.wrap),n.texStorage2D(n.TEXTURE_2D,1,this.internalFormat,e,t),n.bindTexture(n.TEXTURE_2D,null),r}},V=class{constructor(e,t,r){n(this,`texture`),n(this,`gl`),n(this,`framebuffer`);let a=e.createFramebuffer();i(a,`context-unavailable`,`failed to allocate a framebuffer`),this.gl=e,this.framebuffer=a,this.texture=new B(e,{width:t,height:r}),this.attach()}get width(){return this.texture.width}get height(){return this.texture.height}resize(e,t){e===this.texture.width&&t===this.texture.height||(this.texture.resize(e,t),this.attach())}bind(){let{gl:e}=this;e.bindFramebuffer(e.FRAMEBUFFER,this.framebuffer),e.viewport(0,0,this.texture.width,this.texture.height)}dispose(){this.gl.deleteFramebuffer(this.framebuffer),this.texture.dispose()}attach(){let{gl:e}=this;e.bindFramebuffer(e.FRAMEBUFFER,this.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,this.texture.handle,0);let t=e.checkFramebufferStatus(e.FRAMEBUFFER);e.bindFramebuffer(e.FRAMEBUFFER,null),i(t===e.FRAMEBUFFER_COMPLETE,`framebuffer-incomplete`,`framebuffer is incomplete: 0x${t.toString(16)}`)}},Ie=class{constructor(e,t,r){n(this,`front`),n(this,`back`),this.front=new V(e,t,r),this.back=new V(e,t,r)}get read(){return this.front}get write(){return this.back}swap(){let e=this.front;this.front=this.back,this.back=e}resize(e,t){this.front.resize(e,t),this.back.resize(e,t)}dispose(){this.front.dispose(),this.back.dispose()}},H=class{constructor(e,t,r,a){n(this,`textures`),n(this,`gl`),n(this,`framebuffer`),n(this,`buffers`),i(a.length>0,`invalid-options`,`a render target needs at least one attachment`);let o=e.createFramebuffer();i(o,`context-unavailable`,`failed to allocate a framebuffer`),this.gl=e,this.framebuffer=o,this.textures=a.map(n=>new B(e,{...n,width:t,height:r})),this.buffers=a.map((t,n)=>e.COLOR_ATTACHMENT0+n),this.attach()}get width(){return this.textures[0]?.width??0}get height(){return this.textures[0]?.height??0}texture(e){let t=this.textures[e];return i(t,`invalid-options`,`no attachment at index ${e}`),t}resize(e,t){if(e!==this.width||t!==this.height){for(let n of this.textures)n.resize(e,t);this.attach()}}bind(){let{gl:e}=this;e.bindFramebuffer(e.FRAMEBUFFER,this.framebuffer),e.drawBuffers(this.buffers),e.viewport(0,0,this.width,this.height)}dispose(){this.gl.deleteFramebuffer(this.framebuffer);for(let e of this.textures)e.dispose()}attach(){let{gl:e}=this;e.bindFramebuffer(e.FRAMEBUFFER,this.framebuffer),this.textures.forEach((t,n)=>{e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.TEXTURE_2D,t.handle,0)});let t=e.checkFramebufferStatus(e.FRAMEBUFFER);e.bindFramebuffer(e.FRAMEBUFFER,null),i(t===e.FRAMEBUFFER_COMPLETE,`framebuffer-incomplete`,`multi render target is incomplete: 0x${t.toString(16)}`)}},U=class{constructor(e,t,r,i){n(this,`front`),n(this,`back`),this.front=new H(e,t,r,i),this.back=new H(e,t,r,i)}get read(){return this.front}get write(){return this.back}swap(){let e=this.front;this.front=this.back,this.back=e}resize(e,t){this.front.resize(e,t),this.back.resize(e,t)}dispose(){this.front.dispose(),this.back.dispose()}},W={positions:new Float32Array([-1,-1,1,-1,-1,1,1,1]),uvs:new Float32Array([0,0,1,0,0,1,1,1]),indices:new Uint16Array([0,1,2,2,1,3])},G=e=>{let t=e.createBuffer();return i(t,`context-unavailable`,`failed to allocate a buffer`),t},K=0,Le=1,Re=(e,t)=>{let n=e.createVertexArray();i(n,`context-unavailable`,`failed to allocate a vertex array`);let r=G(e),a=G(e),o=G(e);return e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,r),e.bufferData(e.ARRAY_BUFFER,t.positions,e.STATIC_DRAW),e.enableVertexAttribArray(K),e.vertexAttribPointer(K,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,t.uvs,e.STATIC_DRAW),e.enableVertexAttribArray(Le),e.vertexAttribPointer(Le,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,o),e.bufferData(e.ELEMENT_ARRAY_BUFFER,t.indices,e.STATIC_DRAW),e.bindVertexArray(null),e.bindBuffer(e.ARRAY_BUFFER,null),{vao:n,indexCount:t.indices.length,indexType:t.indices instanceof Uint32Array?e.UNSIGNED_INT:e.UNSIGNED_SHORT,dispose:()=>{e.deleteBuffer(r),e.deleteBuffer(a),e.deleteBuffer(o),e.deleteVertexArray(n)}}},q=(e,t)=>{e.bindVertexArray(t.vao),e.drawElements(e.TRIANGLES,t.indexCount,t.indexType,0),e.bindVertexArray(null)},J=`#version 300 es
layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aUv;
out vec2 vUv;

void main() {
  vUv = aUv;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`,ze=`#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uInput;
uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uTime;
uniform float uProgress;
`,Y=(e,t=``)=>`${ze}
${t}
${e}
`,Be=Y(`
void main() {
  fragColor = texture(uInput, vUv);
}
`),Ve=`#version 300 es
precision highp float;
in vec2 vUv;
layout(location = 0) out vec4 outFirst;
layout(location = 1) out vec4 outSecond;
uniform sampler2D uFirst;
uniform sampler2D uSecond;

void main() {
  outFirst = texture(uFirst, vUv);
  outSecond = texture(uSecond, vUv);
}
`,He=class{constructor(e){n(this,`gl`),n(this,`quad`),n(this,`single`),n(this,`pair`),this.gl=e,this.quad=Re(e,W),this.single=new z(e,J,Be),this.pair=new z(e,J,Ve)}copy(e,t,n=0,r=0){let{gl:i}=this;t?t.bind():(i.bindFramebuffer(i.FRAMEBUFFER,null),i.viewport(0,0,n,r)),i.disable(i.BLEND),this.single.use(),this.single.setTexture(`uInput`,e.handle),q(i,this.quad)}copyPair(e,t,n){let{gl:r}=this;n.bind(),r.disable(r.BLEND),this.pair.use(),this.pair.setTexture(`uFirst`,e.handle),this.pair.setTexture(`uSecond`,t.handle),q(r,this.quad)}drawQuad(){q(this.gl,this.quad)}dispose(){this.single.dispose(),this.pair.dispose(),this.quad.dispose()}},Ue=class{constructor(e,t,r,i=J){n(this,`name`),n(this,`enabled`,!0),n(this,`program`),this.name=t,this.program=new z(e,i,r)}render(e){this.program.use(),this.program.set(`uResolution`,new Float32Array([e.width,e.height])),this.program.set(`uTime`,e.frame.time),this.program.set(`uProgress`,e.progress),this.program.setTexture(`uInput`,e.input.handle),this.program.setTexture(`uSource`,e.source.handle),this.bind(e),e.drawQuad()}dispose(){this.program.dispose()}bind(e){}},We=class{constructor(e){n(this,`surface`),n(this,`gl`),n(this,`quad`),n(this,`targets`),n(this,`copy`),n(this,`passes`,[]),this.surface=e,this.gl=e.gl,this.quad=Re(this.gl,W);let{width:t,height:r}=e.drawingBufferSize;this.targets=new Ie(this.gl,t,r),this.copy=new z(this.gl,J,Be)}add(e){this.passes.push(e)}insert(e,t){this.passes.splice(e,0,t)}remove(e){let t=this.passes.indexOf(e);t>=0&&this.passes.splice(t,1)}get length(){return this.passes.length}resize(e,t){this.targets.resize(e,t);for(let n of this.passes)n.resize?.(e,t)}render(e,t,n){let{gl:r}=this,{width:i,height:a}=this.surface.drawingBufferSize,o=this.passes.filter(e=>e.enabled);if(r.disable(r.BLEND),o.length===0){this.surface.bindDefault(),this.copy.use(),this.copy.setTexture(`uInput`,e.handle),q(r,this.quad);return}let s=e;for(let c=0;c<o.length;c+=1){let l=o[c];if(!l)continue;let u=c===o.length-1;u?this.surface.bindDefault():(this.targets.write.bind(),r.clearColor(0,0,0,0),r.clear(r.COLOR_BUFFER_BIT));let d={gl:r,frame:t,progress:n,width:i,height:a,source:e,input:s,drawQuad:()=>q(r,this.quad)};l.render(d),u||(s=this.targets.write.texture,this.targets.swap())}}dispose(){this.passes.length=0,this.copy.dispose(),this.targets.dispose(),this.quad.dispose()}},Ge=class{constructor(e,t,r){n(this,`gl`),n(this,`blitter`),n(this,`programs`),n(this,`fieldA`),n(this,`fieldB`),n(this,`scalar`),n(this,`pair`),n(this,`colour`),n(this,`options`),n(this,`layers`,[]),n(this,`members`,[]),n(this,`origin`),n(this,`originFull`),n(this,`width`,1),n(this,`height`,1),n(this,`simWidth`,4),n(this,`simHeight`,4),n(this,`steps`,0),n(this,`target`,0),n(this,`keyframeSpacing`),n(this,`disposed`,!1),i(r,`context-unavailable`,`the melt simulation needs renderable half float textures`),this.gl=e,this.options=j(t),this.keyframeSpacing=this.options.snapshotEvery,this.blitter=new He(e);let a=t=>new z(e,J,t);this.programs={paint:a(Fe),initA:a(be),initB:a(xe),reinit:a(Se),advectA:a(Ce),advectB:a(Ee),viscosity:a(De),divergence:a(Oe),pressure:a(ke),residual:a(Ae),restrict:a(je),prolongate:a(Me),subtract:a(Ne),rowVolume:a(we),columnVolume:a(Te),shade:a(Pe)},this.fieldA={internalFormat:e.RGBA16F,format:e.RGBA,type:e.HALF_FLOAT,filter:e.LINEAR},this.fieldB={internalFormat:e.RG16F,format:e.RG,type:e.HALF_FLOAT,filter:e.LINEAR},this.scalar={internalFormat:e.R16F,format:e.RED,type:e.HALF_FLOAT,filter:e.LINEAR},this.pair={internalFormat:e.RG16F,format:e.RG,type:e.HALF_FLOAT,filter:e.LINEAR},this.colour={internalFormat:e.RGBA8,format:e.RGBA,type:e.UNSIGNED_BYTE,filter:e.LINEAR},this.origin=new H(e,4,4,[this.colour]),this.originFull=new H(e,4,4,[this.colour]),this.rebuildLayers()}get elapsed(){return this.steps*this.options.stepDuration}get stepDuration(){return this.options.stepDuration}get settings(){return this.options}get pending(){return this.steps!==this.target}get keyframeCount(){return this.layers[0]?.keyframes.size??0}resize(e,t){let n=Math.max(1,Math.round(e)),r=Math.max(1,Math.round(t));n===this.width&&r===this.height||(this.width=n,this.height=r,this.applyScale(),this.originFull.resize(n,r),this.reset())}setMembers(e){this.members=[...e],this.reset()}configure(e){let t=this.options,n=_e(t,e),r=n.layers.length!==t.layers.length||n.simulationScale!==t.simulationScale||n.snapshotEvery!==t.snapshotEvery||n.stepDuration!==t.stepDuration;this.options=n,r?(this.rebuildLayers(),this.applyScale(),this.reset()):(this.layers.forEach((e,t)=>{let r=n.layers[t];r&&(e.layer=r),this.clearKeyframes(e)}),this.keyframeSpacing=n.snapshotEvery)}reset(){this.steps=0,this.target=0,this.keyframeSpacing=this.options.snapshotEvery,this.paintMembers(this.origin),this.paintMembers(this.originFull);for(let e of this.layers)this.clearKeyframes(e),this.initialise(e)}refreshOrigin(){this.paintMembers(this.origin),this.paintMembers(this.originFull)}step(){let e=this.options.stepDuration/this.options.substeps;for(let t=0;t<this.options.substeps;t+=1){let n=this.elapsed+t*e;for(let t of this.layers)this.substep(t,e,n)}this.steps+=1,this.steps%this.keyframeSpacing===0&&this.snapshot()}seek(e,t=1/0){let n=Math.max(0,Math.round(e/this.options.stepDuration));this.target=n,n<this.steps&&!this.restore(n)&&this.reset();let r=t;for(;this.steps<n&&r>0;)this.step(),--r;return this.steps===n}render(){let{gl:e}=this,t=this.programs.shade;e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA);for(let e=this.layers.length-1;e>=0;--e){let n=this.layers[e];if(!n)continue;let{material:r}=n.layer;t.use(),t.set(`uTexel`,this.texel()),t.set(`uMeltPoint`,this.options.meltPoint),t.set(`uRim`,this.options.rim*this.options.simulationScale+2),t.set(`uEdgeWidth`,this.options.edgeWidth),t.set(`uLight`,new Float32Array(this.options.light)),t.set(`uGloss`,r.gloss),t.set(`uFresnel`,r.fresnel),t.set(`uRefraction`,r.refraction),t.set(`uBlend`,r.blend),t.set(`uTranslucency`,r.translucency),t.set(`uAbsorption`,new Float32Array(r.absorption)),t.set(`uTint`,new Float32Array(r.tint)),t.setTexture(`uA`,n.a.read.texture(0).handle),t.setTexture(`uB`,n.b.read.texture(0).handle),t.setTexture(`uOrigin`,this.originFull.texture(0).handle),this.blitter.drawQuad()}}dispose(){if(!this.disposed){this.disposed=!0;for(let e of this.layers)this.disposeLayer(e);this.layers=[],this.origin.dispose(),this.originFull.dispose();for(let e of Object.values(this.programs))e.dispose();this.blitter.dispose()}}texel(){return new Float32Array([1/this.simWidth,1/this.simHeight])}levelTexel(e){return new Float32Array([1/e.width,1/e.height])}buildLevels(e,t){let{gl:n}=this,r=[],i=e,a=t;for(;r.length<6&&(r.push({width:i,height:a,rhs:new H(n,i,a,[this.pair]),pressure:new U(n,i,a,[this.scalar]),residual:new H(n,i,a,[this.scalar])}),!(Math.min(i,a)<=8));)i=Math.ceil(i/2),a=Math.ceil(a/2);return r}disposeLevels(e){for(let t of e)t.rhs.dispose(),t.pressure.dispose(),t.residual.dispose()}applyScale(){this.simWidth=Math.max(4,Math.round(this.width*this.options.simulationScale)),this.simHeight=Math.max(4,Math.round(this.height*this.options.simulationScale)),this.origin.resize(this.simWidth,this.simHeight);for(let e of this.layers)e.a.resize(this.simWidth,this.simHeight),e.b.resize(this.simWidth,this.simHeight),e.rhs.resize(this.simWidth,this.simHeight),e.rows.resize(1,this.simHeight),this.disposeLevels(e.levels),e.levels=this.buildLevels(this.simWidth,this.simHeight),this.clearKeyframes(e)}rebuildLayers(){for(let e of this.layers)this.disposeLayer(e);let{gl:e,simWidth:t,simHeight:n}=this;this.layers=this.options.layers.map(r=>({layer:r,a:new U(e,t,n,[this.fieldA]),b:new U(e,t,n,[this.fieldB]),rhs:new H(e,t,n,[this.fieldA]),rows:new H(e,1,n,[this.scalar]),volume:new H(e,1,1,[this.scalar]),volumeReference:new H(e,1,1,[this.scalar]),levels:this.buildLevels(t,n),keyframes:new Map}))}disposeLayer(e){this.clearKeyframes(e),e.a.dispose(),e.b.dispose(),e.rhs.dispose(),e.rows.dispose(),e.volume.dispose(),e.volumeReference.dispose(),this.disposeLevels(e.levels)}common(e,t,n,r=this.texel()){e.use(),e.set(`uTexel`,r),e.set(`uDt`,t),e.set(`uTime`,n),e.set(`uFloor`,+(this.options.ground===`floor`)),e.set(`uFloorLevel`,2/this.simHeight)}clearTarget(e){let{gl:t}=this;e.bind(),t.disable(t.BLEND),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT)}paintMembers(e){let{gl:t}=this,n=this.programs.paint;this.clearTarget(e),t.enable(t.BLEND),t.blendFunc(t.ONE,t.ONE_MINUS_SRC_ALPHA);for(let e of this.members)n.use(),n.set(`uRect`,new Float32Array(e.rect)),n.set(`uKey`,new Float32Array(e.key?e.key.colour:[0,0,0])),n.set(`uKeyTolerance`,e.key?e.key.tolerance:0),n.set(`uKeyEnabled`,+!!e.key),n.setTexture(`uSource`,e.texture.handle),this.blitter.drawQuad();t.disable(t.BLEND)}initialise(e){let{gl:t}=this;t.disable(t.BLEND),e.a.write.bind(),this.common(this.programs.initA,0,0),this.programs.initA.setTexture(`uOrigin`,this.origin.texture(0).handle),this.blitter.drawQuad(),e.a.swap(),e.b.write.bind(),this.common(this.programs.initB,0,0),this.blitter.drawQuad(),e.b.swap(),this.clearTarget(e.volume),this.clearTarget(e.volumeReference),this.blitter.copy(e.a.read.texture(0),e.rhs);for(let t=0;t<8;t+=1)this.reinit(e,0);this.measureVolume(e),this.blitter.copy(e.volume.texture(0),e.volumeReference);let n=e.levels[0];n&&(this.clearTarget(n.pressure.read),this.clearTarget(n.pressure.write))}reinit(e,t){let n=this.programs.reinit;e.a.write.bind(),this.common(n,0,0),n.set(`uTensionFlow`,t),n.set(`uVolumeGuard`,this.options.volumeGuard),n.set(`uMeltPoint`,this.options.meltPoint),n.setTexture(`uA`,e.a.read.texture(0).handle),n.setTexture(`uRhs`,e.rhs.texture(0).handle),n.setTexture(`uVolume`,e.volume.texture(0).handle),n.setTexture(`uVolumeReference`,e.volumeReference.texture(0).handle),this.blitter.drawQuad(),e.a.swap()}measureVolume(e){let t=this.programs;e.rows.bind(),this.common(t.rowVolume,0,0),t.rowVolume.set(`uCount`,this.simWidth),t.rowVolume.setTexture(`uA`,e.a.read.texture(0).handle),this.blitter.drawQuad(),e.volume.bind(),this.common(t.columnVolume,0,0,new Float32Array([1,1/this.simHeight])),t.columnVolume.set(`uCount`,this.simHeight),t.columnVolume.setTexture(`uRows`,e.rows.texture(0).handle),this.blitter.drawQuad()}smooth(e,t){let n=this.programs.pressure;for(let r=0;r<t;r+=1)e.pressure.write.bind(),this.common(n,0,0,this.levelTexel(e)),n.setTexture(`uPressure`,e.pressure.read.texture(0).handle),n.setTexture(`uDivergence`,e.rhs.texture(0).handle),this.blitter.drawQuad(),e.pressure.swap()}vcycle(e,t){let n=e[t];if(!n)return;let r=e[t+1];if(!r){this.smooth(n,8);return}this.smooth(n,4);let i=this.programs.residual;n.residual.bind(),this.common(i,0,0,this.levelTexel(n)),i.setTexture(`uPressure`,n.pressure.read.texture(0).handle),i.setTexture(`uDivergence`,n.rhs.texture(0).handle),this.blitter.drawQuad();let a=this.programs.restrict;r.rhs.bind(),this.common(a,0,0,this.levelTexel(r)),a.setTexture(`uResidual`,n.residual.texture(0).handle),a.setTexture(`uFineRhs`,n.rhs.texture(0).handle),this.blitter.drawQuad(),this.clearTarget(r.pressure.read),this.clearTarget(r.pressure.write),this.vcycle(e,t+1);let o=this.programs.prolongate;n.pressure.write.bind(),this.common(o,0,0,this.levelTexel(n)),o.setTexture(`uPressure`,n.pressure.read.texture(0).handle),o.setTexture(`uCoarse`,r.pressure.read.texture(0).handle),o.setTexture(`uDivergence`,n.rhs.texture(0).handle),this.blitter.drawQuad(),n.pressure.swap(),this.smooth(n,4)}project(e,t,n){let r=e.levels[0];if(!r)return;let i=this.programs;if(r.rhs.bind(),this.common(i.divergence,t,n),i.divergence.setTexture(`uA`,e.a.read.texture(0).handle),this.blitter.drawQuad(),this.options.pressureSolver===`jacobi`)this.smooth(r,this.options.pressureIterations);else for(let t=0;t<this.options.pressureCycles;t+=1)this.vcycle(e.levels,0);e.a.write.bind(),this.common(i.subtract,t,n),i.subtract.setTexture(`uA`,e.a.read.texture(0).handle),i.subtract.setTexture(`uPressure`,r.pressure.read.texture(0).handle),this.blitter.drawQuad(),e.a.swap()}substep(e,t,n){let{gl:r,options:i}=this,{material:a}=e.layer,o=this.programs;r.disable(r.BLEND);let s=.15*this.simHeight*i.gravity,c=Math.max(.05,a.viscosity/a.density*this.simHeight*.12),l=i.solidViscosity*this.simHeight,u=a.yield*this.simHeight*.3,d=a.tension*.4/(2*Math.PI*t*t),f=a.tension*i.curvatureFlow;e.b.write.bind(),this.common(o.advectB,t,n),o.advectB.setTexture(`uA`,e.a.read.texture(0).handle),o.advectB.setTexture(`uB`,e.b.read.texture(0).handle),this.blitter.drawQuad(),e.b.swap(),e.a.write.bind(),this.common(o.advectA,t,n),o.advectA.set(`uGravity`,s),o.advectA.set(`uDrag`,i.drag),o.advectA.set(`uSigma`,d),o.advectA.set(`uMeltRate`,a.meltRate),o.advectA.set(`uMeltPoint`,i.meltPoint),o.advectA.set(`uConduction`,i.conduction),o.advectA.set(`uCooling`,a.cooling),o.advectA.set(`uHeatTop`,i.heatTop),o.advectA.set(`uCoreHeat`,i.coreHeat),o.advectA.set(`uSurfaceHeat`,i.surfaceHeat),o.advectA.set(`uSurfaceDepth`,i.surfaceDepth),o.advectA.set(`uColumnFeed`,i.columnFeed),o.advectA.set(`uOnsetSpread`,i.onsetSpread),o.advectA.set(`uNoiseScale`,i.noiseScale),o.advectA.set(`uFreezePoint`,i.freezePoint),o.advectA.set(`uSeed`,i.seed+this.layers.indexOf(e)*17.3),o.advectA.set(`uDelay`,e.layer.delay),o.advectA.setTexture(`uA`,e.a.read.texture(0).handle),this.blitter.drawQuad(),e.a.swap(),this.blitter.copy(e.a.read.texture(0),e.rhs);for(let r=0;r<i.viscosityIterations;r+=1)e.a.write.bind(),this.common(o.viscosity,t,n),o.viscosity.set(`uNuSolid`,l),o.viscosity.set(`uNuLiquid`,c),o.viscosity.set(`uMeltPoint`,i.meltPoint),o.viscosity.set(`uYield`,u),o.viscosity.setTexture(`uA`,e.a.read.texture(0).handle),o.viscosity.setTexture(`uRhs`,e.rhs.texture(0).handle),this.blitter.drawQuad(),e.a.swap();this.project(e,t,n);for(let t=0;t<2;t+=1)this.reinit(e,f);this.measureVolume(e)}snapshot(){let e=this.layers[0];if(e&&!e.keyframes.has(this.steps)){for(;e.keyframes.size>=this.options.maxKeyframes;)this.thinKeyframes();if(this.steps%this.keyframeSpacing===0)for(let e of this.layers){let t=new H(this.gl,this.simWidth,this.simHeight,[this.fieldA,this.fieldB]);this.blitter.copyPair(e.a.read.texture(0),e.b.read.texture(0),t),e.keyframes.set(this.steps,t)}}}thinKeyframes(){let e=this.keyframeSpacing*2;for(let t of this.layers)for(let[n,r]of t.keyframes)n%e!==0&&(r.dispose(),t.keyframes.delete(n));this.keyframeSpacing=e}restore(e){let t=this.layers[0];if(!t)return!1;let n=-1;for(let r of t.keyframes.keys())r<=e&&r>n&&(n=r);if(n<0)return!1;for(let e of this.layers)if(!e.keyframes.has(n))return!1;for(let e of this.layers){let t=e.keyframes.get(n);if(!t)return!1;this.blitter.copy(t.texture(0),e.a.write),e.a.swap(),this.blitter.copy(t.texture(1),e.b.write),e.b.swap();let r=e.levels[0];r&&this.clearTarget(r.pressure.read)}return this.steps=n,!0}clearKeyframes(e){for(let t of e.keyframes.values())t.dispose();e.keyframes.clear()}},Ke=class extends Ue{constructor(e,t){super(e,t.name,t.fragment),n(this,`uniforms`),this.uniforms={...t.uniforms}}bind(e){for(let e of Object.keys(this.uniforms)){let t=this.uniforms[e];t!==void 0&&this.program.set(e,t)}}},qe=`
float meltProgress() {
  return clamp(uProgress, 0.0, 1.0);
}
`,Je=`
uniform float uRadius;

void main() {
  vec2 texel = uRadius / uResolution;
  vec4 total = vec4(0.0);
  float weightSum = 0.0;
  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 offset = vec2(float(x), float(y)) * texel;
      float weight = exp(-dot(offset, offset) * 40.0);
      total += texture(uInput, vUv + offset) * weight;
      weightSum += weight;
    }
  }
  fragColor = total / max(weightSum, 1e-4);
}
`,Ye=`
uniform vec3 uTint;
uniform float uAmount;

void main() {
  vec4 source = texture(uInput, vUv);
  vec3 mixed = mix(source.rgb, uTint * max(source.a, 1e-4), uAmount);
  fragColor = vec4(mixed, source.a);
}
`,Xe=`
uniform float uCutoff;
uniform float uSoftness;

void main() {
  vec4 source = texture(uInput, vUv);
  float alpha = smoothstep(uCutoff - uSoftness, uCutoff + uSoftness, source.a);
  fragColor = vec4(source.rgb * alpha, source.a * alpha);
}
`,Ze=`
uniform float uAmount;

void main() {
  vec2 direction = (vUv - 0.5) * uAmount * meltProgress();
  float r = texture(uInput, vUv + direction).r;
  vec4 g = texture(uInput, vUv);
  float b = texture(uInput, vUv - direction).b;
  fragColor = vec4(r, g.g, b, g.a);
}
`,Qe=(e=2)=>({name:`blur`,uniforms:{uRadius:e},fragment:Y(Je)}),$e=(e=[1,1,1],t=.2)=>({name:`tint`,uniforms:{uTint:new Float32Array(e),uAmount:t},fragment:Y(Ye)}),et=(e=.5,t=.1)=>({name:`threshold`,uniforms:{uCutoff:e,uSoftness:t},fragment:Y(Xe)}),tt=(e=.004)=>({name:`chromatic-aberration`,uniforms:{uAmount:e},fragment:Y(Ze,qe)}),nt=class{constructor(e){n(this,`gl`),n(this,`entries`,[]),this.gl=e}get passes(){return this.entries}add(e){let t=new Ke(this.gl,e);return this.entries.push(t),t}remove(e){let t=this.entries.indexOf(e);t<0||(this.entries.splice(t,1),e.dispose())}dispose(){for(let e of this.entries)e.dispose();this.entries.length=0}},rt=`http://www.w3.org/2000/svg`,X={sag:.16,lateral:.08,columns:4,streak:.08,octaves:2,blur:.008,pinch:6,dripRoom:.6,topRoom:.08,sideRoom:.15},Z={sag:[0,1],lateral:[0,.5],columns:[.5,64],streak:[.01,1],octaves:[1,5],blur:[0,.05],pinch:[1,24],dripRoom:[0,2],topRoom:[0,1],sideRoom:[0,1]},it={width:300,height:300},at=4,ot=.5,st=.5,ct=.35,lt=.3,ut=.55,dt=`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  `,ft=0,Q=e=>document.createElementNS(rt,e),pt=e=>({sag:a(e.sag??X.sag,...Z.sag),lateral:a(e.lateral??X.lateral,...Z.lateral),columns:a(e.columns??X.columns,...Z.columns),streak:a(e.streak??X.streak,...Z.streak),octaves:Math.round(a(e.octaves??X.octaves,...Z.octaves)),blur:a(e.blur??X.blur,...Z.blur),pinch:a(e.pinch??X.pinch,...Z.pinch),dripRoom:a(e.dripRoom??X.dripRoom,...Z.dripRoom),topRoom:a(e.topRoom??X.topRoom,...Z.topRoom),sideRoom:a(e.sideRoom??X.sideRoom,...Z.sideRoom)}),mt=e=>at*e.sag*.5,ht=e=>({width:Math.max(1,e?.width??it.width),height:Math.max(1,e?.height??it.height)}),gt=class{constructor(e={}){n(this,`id`),n(this,`root`),n(this,`settings`),n(this,`turbulence`),n(this,`displacement`),n(this,`softening`),n(this,`ramp`),n(this,`box`),n(this,`progress`,0),n(this,`frequencyX`,0),n(this,`frequencyY`,0),n(this,`scale`,0),n(this,`softness`,0);let t=e.seed??`meltgl`,r=typeof t==`string`?c(t):t>>>0;ft+=1;let i=`${ft.toString(36)}${Math.random().toString(36).slice(2,6)}`;this.id=e.id??`meltgl-melt-${r.toString(36)}-${i}`,this.settings=pt(e),this.box=ht(e.box),this.root=Q(`svg`),this.root.setAttribute(`aria-hidden`,`true`),this.root.setAttribute(`focusable`,`false`),this.root.setAttribute(`width`,`0`),this.root.setAttribute(`height`,`0`),this.root.style.position=`absolute`,this.root.style.width=`0`,this.root.style.height=`0`,this.root.style.overflow=`hidden`,this.root.style.pointerEvents=`none`;let a=Q(`filter`);a.setAttribute(`id`,this.id),a.setAttribute(`filterUnits`,`objectBoundingBox`),a.setAttribute(`primitiveUnits`,`userSpaceOnUse`),a.setAttribute(`color-interpolation-filters`,`sRGB`);let o=Math.max(this.settings.dripRoom,mt(this.settings));a.setAttribute(`x`,(-this.settings.sideRoom).toFixed(4)),a.setAttribute(`y`,(-this.settings.topRoom).toFixed(4)),a.setAttribute(`width`,(1+this.settings.sideRoom*2).toFixed(4)),a.setAttribute(`height`,(1+this.settings.topRoom+o).toFixed(4)),this.turbulence=Q(`feTurbulence`),this.turbulence.setAttribute(`type`,`fractalNoise`),this.turbulence.setAttribute(`numOctaves`,String(this.settings.octaves)),this.turbulence.setAttribute(`seed`,String(r%1e3)),this.turbulence.setAttribute(`stitchTiles`,`noStitch`),this.turbulence.setAttribute(`baseFrequency`,`0 0`),this.turbulence.setAttribute(`result`,`meltNoise`);let s=Q(`feColorMatrix`);s.setAttribute(`in`,`meltNoise`),s.setAttribute(`type`,`matrix`),s.setAttribute(`values`,this.fieldValues()),s.setAttribute(`result`,`meltField`),this.displacement=Q(`feDisplacementMap`),this.displacement.setAttribute(`in`,`SourceGraphic`),this.displacement.setAttribute(`in2`,`meltField`),this.displacement.setAttribute(`scale`,`0`),this.displacement.setAttribute(`xChannelSelector`,`R`),this.displacement.setAttribute(`yChannelSelector`,`G`),this.displacement.setAttribute(`result`,`meltDisplaced`),this.softening=this.settings.blur>0?Q(`feGaussianBlur`):null,this.softening&&(this.softening.setAttribute(`in`,`meltDisplaced`),this.softening.setAttribute(`edgeMode`,`none`),this.softening.setAttribute(`stdDeviation`,`0 0`),this.softening.setAttribute(`result`,`meltSoftened`)),this.ramp=Q(`feColorMatrix`),this.ramp.setAttribute(`in`,this.softening?`meltSoftened`:`meltDisplaced`),this.ramp.setAttribute(`type`,`matrix`),this.ramp.setAttribute(`values`,`${dt}0 0 0 1 0`),this.ramp.setAttribute(`result`,`meltOut`),a.append(this.turbulence,s,this.displacement),this.softening&&a.append(this.softening),a.append(this.ramp);let l=Q(`defs`);l.append(a),this.root.append(l),this.applyBox(),this.setProgress(0)}get cssValue(){return`url(#${this.id})`}mount(e=document.body){this.root.parentNode!==e&&e.append(this.root)}setBox(e){let t=ht(e);t.width===this.box.width&&t.height===this.box.height||(this.box=t,this.applyBox(),this.setProgress(this.progress))}setProgress(e){let t=o(e);this.progress=t;let n=t*t,r=this.frequencyX*(1-lt*n),i=this.frequencyY*(1-ut*n);if(this.turbulence.setAttribute(`baseFrequency`,`${r.toFixed(6)} ${i.toFixed(6)}`),this.displacement.setAttribute(`scale`,(this.scale*n).toFixed(2)),this.softening){let e=this.softness*n;this.softening.setAttribute(`stdDeviation`,`${(e*ct).toFixed(3)} ${e.toFixed(3)}`)}let a=s(1,this.settings.pinch,n),c=st*(1-a);this.ramp.setAttribute(`values`,`${dt}0 0 0 ${a.toFixed(3)} ${c.toFixed(3)}`)}dispose(){this.root.remove()}fieldValues(){let e=this.settings.lateral;return[`${e.toFixed(4)} 0 0 0 ${(.5-e*.5).toFixed(4)}`,`0 ${ot.toFixed(4)} 0 0 0`,`0 0 0 0 0`,`0 0 0 0 1`].join(`  `)}applyBox(){this.frequencyX=this.settings.columns/this.box.width,this.frequencyY=this.frequencyX*this.settings.streak,this.scale=at*this.settings.sag*this.box.height,this.softness=this.settings.blur*this.box.height}},_t=2,vt=-3,yt=4.7,bt=.45,xt=.06,St=.004,Ct=.014,wt=2.5,Tt=12,Et=.14,Dt=.04,Ot=1,kt=4,At=11,jt=(e,t)=>({dripRoom:e.dripRoom??t.dripRoom,topRoom:e.topRoom??t.topRoom,sideRoom:e.sideRoom??t.sideRoom}),Mt=(e,t)=>e.dripRoom===t.dripRoom&&e.topRoom===t.topRoom&&e.sideRoom===t.sideRoom,Nt=class{constructor(e){n(this,`backend`,`svg`),n(this,`dynamic`),n(this,`settled`,!0),n(this,`target`),n(this,`source`),n(this,`duration`),n(this,`layer`),n(this,`canvas`),n(this,`context`),n(this,`observer`),n(this,`filter`),n(this,`material`),n(this,`noiseScale`),n(this,`seed`),n(this,`room`),n(this,`scratch`,null),n(this,`box`,null),n(this,`progress`,0),n(this,`restorePosition`,null),n(this,`restoreOverflow`,null),n(this,`mounted`,!1),n(this,`disposed`,!1),this.target=e.target,this.source=e.source,this.dynamic=e.source.dynamic,this.duration=Math.max(.01,e.duration),this.material=w(e.config.layers?.[0]?.material??e.config.material),this.noiseScale=e.config.noiseScale??kt,this.seed=e.config.seed??At,this.room=jt(e.config,{}),this.layer=document.createElement(`div`),this.layer.setAttribute(`data-meltgl`,`svg-melt`),this.layer.style.position=`absolute`,this.layer.style.left=`0`,this.layer.style.top=`0`,this.layer.style.width=`100%`,this.layer.style.height=`100%`,this.layer.style.display=`block`,this.layer.style.overflow=`visible`,this.layer.style.pointerEvents=`none`,this.layer.style.zIndex=`1`,this.canvas=document.createElement(`canvas`),this.canvas.style.display=`block`,this.canvas.style.position=`absolute`,this.canvas.style.left=`0`,this.canvas.style.top=`0`,this.canvas.style.width=`100%`,this.canvas.style.height=`100%`,this.layer.append(this.canvas),this.context=this.canvas.getContext(`2d`),this.observer=typeof ResizeObserver>`u`?null:new ResizeObserver(()=>this.layout()),this.filter=this.build()}async prepare(){if(await this.source.load(),this.disposed)return;let e=getComputedStyle(this.target);e.position===`static`&&(this.restorePosition=this.target.style.position,this.target.style.position=`relative`),e.overflow!==`visible`&&(this.restoreOverflow=this.target.style.overflow,this.target.style.overflow=`visible`),this.target.append(this.layer),this.filter.mount(this.filterHost()),this.layer.style.filter=this.filter.cssValue,this.mounted=!0,this.layout(),this.observer?.observe(this.target)}seek(e){this.progress=o(e/this.duration),this.filter.setProgress(this.progress)}draw(e,t){!this.mounted||!this.dynamic||this.paint()}configure(e){let t=e.material!==void 0||e.layers!==void 0;t&&(this.material=w(e.layers?.[0]?.material??e.material)),e.noiseScale!==void 0&&(this.noiseScale=e.noiseScale),e.seed!==void 0&&(this.seed=e.seed);let n=jt(e,this.room),r=!Mt(n,this.room);if(this.room=n,!t&&e.noiseScale===void 0&&e.seed===void 0&&!r)return;let i=this.filter;this.filter=this.build(),this.filter.setProgress(this.progress),this.mounted&&(this.filter.mount(this.filterHost()),this.layer.style.filter=this.filter.cssValue),i.dispose()}dispose(){this.disposed||(this.disposed=!0,this.mounted=!1,this.observer?.disconnect(),this.layer.style.filter=``,this.layer.remove(),this.filter.dispose(),this.source.dispose(),this.scratch=null,this.restorePosition!==null&&(this.target.style.position=this.restorePosition,this.restorePosition=null),this.restoreOverflow!==null&&(this.target.style.overflow=this.restoreOverflow,this.restoreOverflow=null))}build(){let e=Math.max(1e-6,this.material.viscosity/this.material.density),t=o((Math.log10(e)-vt)/yt),n=o(this.material.tension);return new gt({seed:this.seed,sag:s(bt,xt,t),lateral:s(Et,Dt,n),columns:this.noiseScale*Ot,blur:s(St,Ct,n),pinch:s(wt,Tt,n),box:this.box??void 0,...this.room})}filterHost(){let e=this.target.getRootNode();return e instanceof ShadowRoot?e:document.body}layout(){if(!this.mounted)return;let e=this.layer.getBoundingClientRect(),t=e.width||this.target.clientWidth,n=e.height||this.target.clientHeight;if(t<=0||n<=0)return;this.box={width:t,height:n};let r=Math.min(window.devicePixelRatio||1,_t),i={width:Math.max(1,Math.round(t*r)),height:Math.max(1,Math.round(n*r))};(this.canvas.width!==i.width||this.canvas.height!==i.height)&&(this.canvas.width=i.width,this.canvas.height=i.height),this.filter.setBox(this.box),this.paint()}paint(){let e=this.context,t=this.source.frame();if(!e||!t)return;let{width:n,height:r}=this.canvas;if(n===0||r===0)return;e.clearRect(0,0,n,r);let i=this.toDrawable(t);if(!i)return;let a=this.source.width>0?this.source.width:n,o=this.source.height>0?this.source.height:r,s=Math.min(n/a,r/o),c=a*s,l=o*s;e.drawImage(i,(n-c)/2,(r-l)/2,c,l)}toDrawable(e){if(!(e instanceof ImageData))return e;let t=this.scratch??document.createElement(`canvas`);this.scratch=t,(t.width!==e.width||t.height!==e.height)&&(t.width=e.width,t.height=e.height);let n=t.getContext(`2d`);return n?(n.putImageData(e,0,0),t):null}},Pt={bottom:0,top:0,sides:0},Ft=class extends d{constructor(e){super(),n(this,`target`),n(this,`surface`),n(this,`observer`),n(this,`restorePosition`,null),n(this,`restoreOverflow`,null),n(this,`extents`),n(this,`mounted`,!1),n(this,`lastBox`,{width:0,height:0}),n(this,`lastCanvas`,{width:0,height:0}),n(this,`lastPixels`,{width:0,height:0}),this.target=e.target,this.surface=e.surface??new p,this.extents={...Pt,...e.extents};let t=this.surface.canvas;t.style.position=`absolute`,t.style.pointerEvents=`none`,t.style.zIndex=String(e.zIndex??1),this.observer=new ResizeObserver(()=>this.sync())}get size(){let e=this.target.getBoundingClientRect();return{width:e.width,height:e.height}}get room(){return this.extents}get canvasSize(){let{width:e,height:t}=this.size;return{width:e+this.extents.sides*2,height:t+this.extents.top+this.extents.bottom}}get bounds(){return this.target.getBoundingClientRect()}setExtents(e){this.extents={bottom:Math.max(0,e.bottom??this.extents.bottom),top:Math.max(0,e.top??this.extents.top),sides:Math.max(0,e.sides??this.extents.sides)},this.sync()}mount(){if(this.mounted)return;this.mounted=!0;let e=getComputedStyle(this.target);e.position===`static`&&(this.restorePosition=this.target.style.position,this.target.style.position=`relative`),e.overflow!==`visible`&&(this.restoreOverflow=this.target.style.overflow,this.target.style.overflow=`visible`),this.target.append(this.surface.canvas),this.observer.observe(this.target),this.sync()}unmount(){this.mounted&&(this.mounted=!1,this.observer.unobserve(this.target),this.surface.canvas.remove(),this.restorePosition!==null&&(this.target.style.position=this.restorePosition,this.restorePosition=null),this.restoreOverflow!==null&&(this.target.style.overflow=this.restoreOverflow,this.restoreOverflow=null))}dispose(){this.unmount(),this.observer.disconnect(),this.surface.dispose(),this.clear()}sync(){let e=this.size,{width:t,height:n}=this.canvasSize;if(t===0||n===0)return;let r=this.surface.canvas;r.style.left=`${-this.extents.sides}px`,r.style.top=`${-this.extents.top}px`,r.style.width=`${t}px`,r.style.height=`${n}px`,this.surface.resize(t,n);let i=this.surface.drawingBufferSize;e.width===this.lastBox.width&&e.height===this.lastBox.height&&t===this.lastCanvas.width&&n===this.lastCanvas.height&&i.width===this.lastPixels.width&&i.height===this.lastPixels.height||(this.lastBox=e,this.lastCanvas={width:t,height:n},this.lastPixels=i,this.emit(`resize`,{width:t,height:n}))}},It=`the source is cross-origin and was not loaded with crossOrigin="anonymous"`,Lt=e=>{let t=new p({maxPixelRatio:e.maxPixelRatio}),{capabilities:n,gl:i}=t,a=n.colorBufferFloat||n.colorBufferHalfFloat;if(!a)throw t.dispose(),new r(`context-unavailable`,`webgl2 cannot render to float targets, the melt simulation needs ${ne}`);let o=[t];try{let n=new Ge(i,e.simulation,a);o.push(n);let r=new B(i,{flipY:!0,premultiply:!0});o.push(r);let s=new Ft({target:e.target,surface:t});o.push(s);let c=new nt(i);o.push(c);let l=new We(t);o.push(l);for(let t of e.filters)l.add(c.add(t));return{surface:t,simulation:n,texture:r,host:s,filters:c,pipeline:l,offscreen:new V(i,1,1)}}catch(e){for(let e of o.reverse())e.dispose();throw e}},Rt=class{constructor(e){n(this,`backend`,`webgl2`),n(this,`dynamic`),n(this,`host`),n(this,`simulation`),n(this,`surface`),n(this,`source`),n(this,`texture`),n(this,`filters`),n(this,`pipeline`),n(this,`offscreen`),n(this,`keyMode`),n(this,`maxStepsPerFrame`),n(this,`key`,null),n(this,`members`,null),n(this,`caughtUp`,!0),n(this,`prepared`,!1),n(this,`disposed`,!1);let t=Lt(e);this.surface=t.surface,this.simulation=t.simulation,this.texture=t.texture,this.host=t.host,this.filters=t.filters,this.pipeline=t.pipeline,this.offscreen=t.offscreen,this.source=e.source,this.keyMode=e.key,this.maxStepsPerFrame=e.maxStepsPerFrame,this.dynamic=e.source.dynamic,this.host.on(`resize`,()=>this.layout());let{onContextLost:r}=e;r&&this.surface.on(`contextlost`,()=>r())}get settled(){return this.caughtUp}async prepare(){await this.source.load(),this.upload(),this.key=this.resolveKey(),this.applyRoom(),this.host.mount(),this.layout(),this.prepared=!0}seek(e){!this.prepared||this.surface.lost||(this.caughtUp=this.simulation.seek(e,this.maxStepsPerFrame))}draw(e,t){if(!this.prepared||this.surface.lost)return;this.dynamic&&(this.upload(),this.simulation.refreshOrigin());let{gl:n}=this.surface;n.disable(n.DEPTH_TEST),this.pipeline.length===0?(this.surface.bindDefault(),this.surface.clearTo(),this.simulation.render()):(this.offscreen.bind(),n.clearColor(0,0,0,0),n.clear(n.COLOR_BUFFER_BIT),this.simulation.render(),this.surface.bindDefault(),this.surface.clearTo(),this.pipeline.render(this.offscreen.texture,e,t))}configure(e){this.simulation.configure(e),this.applyRoom()}dispose(){this.disposed||(this.disposed=!0,this.pipeline.dispose(),this.filters.dispose(),this.offscreen.dispose(),this.simulation.dispose(),this.texture.dispose(),this.source.dispose(),this.host.dispose())}applyRoom(){let{dripRoom:e,topRoom:t,sideRoom:n}=this.simulation.settings,{width:r,height:i}=this.host.size,a={bottom:i*e,top:i*t,sides:r*n},o=this.host.room;a.bottom===o.bottom&&a.top===o.top&&a.sides===o.sides||this.host.setExtents(a)}resolveKey(){if(this.keyMode===`none`)return null;if(this.keyMode!==`auto`)return this.keyMode;let e=this.source.frame();return e?ue(e):null}upload(){let e=this.source.frame();if(e&&this.source.width!==0&&this.source.height!==0)try{this.texture.upload(e,this.source.width,this.source.height)}catch{throw new r(`source-unavailable`,It)}}layout(){let{width:e,height:t}=this.surface.drawingBufferSize;if(e===0||t===0)return;let n=this.host.size,r=this.host.canvasSize,i=this.host.room;if(r.width===0||r.height===0)return;let a=[i.sides/r.width,i.bottom/r.height,n.width/r.width,n.height/r.height];this.offscreen.resize(e,t),this.pipeline.resize(e,t),this.simulation.resize(e,t);let o=this.members;o&&o.texture===this.texture&&o.key===this.key&&o.rect[0]===a[0]&&o.rect[1]===a[1]&&o.rect[2]===a[2]&&o.rect[3]===a[3]||(this.members={rect:a,key:this.key,texture:this.texture},this.simulation.setMembers([{texture:this.texture,rect:a,key:this.key}]))}},zt=e=>({...e.simulation,material:e.material??`wax`,...e.layers&&e.layers.length>0?{layers:e.layers}:{}}),Bt=e=>e instanceof r?e:new r(`source-unavailable`,e instanceof Error?e.message:String(e)),$=class e extends d{constructor(e){super(),n(this,`renderer`),n(this,`transition`),n(this,`duration`),n(this,`clock`),n(this,`reducedMotion`),n(this,`prepared`,!1),n(this,`suspended`,!1),n(this,`disposed`,!1),n(this,`onTick`,e=>{this.render(e)}),n(this,`onContextLost`,()=>{this.clock.stop(),this.emit(`contextlost`,void 0)}),ae(e),this.reducedMotion=(e.respectReducedMotion??!0)&&se(),this.duration=a(e.duration??m.duration,...h.duration);let t=e.backend??`auto`,r=t===`webgl2`||t===`auto`&&re()===`webgl2`,i=zt(e),o=pe(e.source);this.renderer=r?new Rt({target:e.target,source:o,key:e.key??`auto`,simulation:i,filters:e.filters??[],maxPixelRatio:e.maxPixelRatio??m.maxPixelRatio,maxStepsPerFrame:oe(e.maxStepsPerFrame),onContextLost:()=>this.onContextLost()}):new Nt({target:e.target,source:o,config:i,duration:this.duration}),this.transition=new ie({duration:this.reducedMotion?m.reducedMotionDuration:this.duration,easing:e.easing??`linear`,loop:e.loop??!1}),this.clock=new f,this.transition.attach(this.clock),this.clock.on(`tick`,this.onTick),this.transition.on(`statechange`,e=>this.emit(`statechange`,e)),this.transition.on(`complete`,e=>{this.emit(`complete`,e),this.syncClock()})}static async create(t){let n=new e(t);try{await n.renderer.prepare(),n.prepared=!0,n.render()}catch(e){throw n.dispose(),Bt(e)}return n.syncClock(),t.autoPlay&&n.play(),n}get progress(){return this.transition.progress}get state(){return this.transition.state}get backend(){return this.renderer.backend}get settled(){return this.renderer.settled}play(){this.assertLive(),this.transition.play(),this.syncClock()}reverse(){this.assertLive(),this.transition.reverse(),this.syncClock()}toggle(){this.assertLive(),this.transition.toggle(),this.syncClock()}pause(){this.assertLive(),this.transition.pause(),this.syncClock()}suspend(){this.assertLive(),this.suspended=!0,this.clock.stop()}resume(){this.assertLive(),this.suspended=!1,this.syncClock()}seek(e){this.assertLive(),this.transition.seek(e),this.render()}reset(){this.assertLive(),this.transition.reset(),this.render()}configure(e){this.assertLive(),this.renderer.configure(e),this.render()}dispose(){this.disposed||(this.disposed=!0,this.clock.dispose(),this.transition.dispose(),this.renderer.dispose(),this.clear())}assertLive(){if(this.disposed)throw new r(`disposed`,`this melt has been disposed`)}syncClock(){this.disposed||this.suspended||(this.transition.running||this.renderer.dynamic||!this.renderer.settled?this.clock.start():this.clock.stop())}render(e={time:this.clock.time,delta:0,frame:0}){!this.prepared||this.disposed||(this.renderer.seek(this.transition.eased*this.duration),this.renderer.draw(e,this.transition.progress),this.emit(`progress`,this.transition.progress),this.syncClock())}},Vt=e=>$.create(e);export{T as DEFAULT_SIMULATION_OPTIONS,v as ImageSource,S as MATERIALS,C as MATERIAL_RANGES,r as MeltError,$ as MeltGL,E as SIMULATION_RANGES,y as VideoSource,Qe as blur,tt as chromaticAberration,Vt as createMelt,ue as estimateKey,w as resolveMaterial,et as threshold,$e as tint};