// Background service worker for ProposalForge extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('ProposalForge extension installed')
})

// Listen for tab updates to inject content script on supported platforms
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const supportedPlatforms = [
      'upwork.com',
      'thumbtack.com',
      'fiverr.com',
      'houzz.com',
    ]
    
    if (supportedPlatforms.some(platform => tab.url?.includes(platform))) {
      // Content script will be injected automatically via manifest
      console.log('Supported platform detected:', tab.url)
    }
  }
})

