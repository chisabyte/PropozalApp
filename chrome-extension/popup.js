// Popup script for ProposalForge Chrome Extension

document.getElementById('generateBtn').addEventListener('click', async () => {
  const button = document.getElementById('generateBtn')
  button.disabled = true
  button.textContent = 'Extracting job data...'

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    // Extract job data from page
    const results = await chrome.tabs.sendMessage(tab.id, { action: 'extractJobData' })
    
    if (results && results.jobText) {
      // Open ProposalForge in new tab with extracted data
      const proposalForgeUrl = `https://proposalforge.com/dashboard/new-proposal?rfp=${encodeURIComponent(results.jobText)}&platform=${results.platform || 'Other'}`
      chrome.tabs.create({ url: proposalForgeUrl })
      window.close()
    } else {
      alert('Could not extract job data. Please make sure you\'re on a supported job platform (Upwork, Thumbtack).')
      button.disabled = false
      button.textContent = 'Generate Proposal'
    }
  } catch (error) {
    console.error('Error:', error)
    alert('Error extracting job data. Please try again.')
    button.disabled = false
    button.textContent = 'Generate Proposal'
  }
})

