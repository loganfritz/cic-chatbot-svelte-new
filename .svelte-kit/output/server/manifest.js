export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".DS_Store","BotAvatar.png","UserAvatar.svg","favicon.png","header_logo.png"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml"},
	_: {
		client: {"start":"_app/immutable/entry/start.DnGuJ-UH.js","app":"_app/immutable/entry/app.B8mARXTB.js","imports":["_app/immutable/entry/start.DnGuJ-UH.js","_app/immutable/chunks/entry.B7pDDreb.js","_app/immutable/chunks/runtime.CWJnnQo5.js","_app/immutable/entry/app.B8mARXTB.js","_app/immutable/chunks/runtime.CWJnnQo5.js","_app/immutable/chunks/store.3Nj1NEUS.js","_app/immutable/chunks/events.FpVn9NNz.js","_app/immutable/chunks/disclose-version.CoDnOFHG.js","_app/immutable/chunks/index-client.pT79vmHB.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
