(()=>{'use strict';
// Automatic hard page reloads were intentionally removed.
// The dashboard already receives live ticket/Firebase update events, so forcing
// window.location.replace() after inactivity only causes unnecessary reloads,
// repeated script initialization, and a sluggish feeling when returning to the page.
// Keep this file as a no-op for backwards-compatible script loading.
window.dispatchEvent(new CustomEvent('idle-refresh-disabled',{detail:{reason:'live-sync-active'}}));
})();