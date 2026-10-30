const STAMP_KEY = 'ticketTrackerQuickStamp';

function saveStamp(timestamp = Date.now()) {
  const stamp = {
    timestamp: Number(timestamp) || Date.now(),
    nonce: `${Date.now()}-${Math.random()}`
  };
  chrome.storage.local.set({ [STAMP_KEY]: stamp });
}

chrome.commands.onCommand.addListener(command => {
  if (command === 'quick-stamp') saveStamp();
});

chrome.runtime.onMessage.addListener(message => {
  if (message?.type === 'QUICK_STAMP') saveStamp(message.timestamp);
});
