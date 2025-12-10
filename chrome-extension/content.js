// Content script for extracting job data from platforms

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJobData') {
    const jobData = extractJobData()
    sendResponse(jobData)
  }
  return true
})

function extractJobData() {
  const url = window.location.href
  let platform = 'Other'
  let jobText = ''

  // Detect platform
  if (url.includes('upwork.com')) {
    platform = 'Upwork'
    jobText = extractUpworkJob()
  } else if (url.includes('thumbtack.com')) {
    platform = 'Thumbtack'
    jobText = extractThumbtackJob()
  } else if (url.includes('fiverr.com')) {
    platform = 'Fiverr'
    jobText = extractFiverrJob()
  } else if (url.includes('houzz.com')) {
    platform = 'Houzz'
    jobText = extractHouzzJob()
  } else {
    // Generic extraction
    jobText = extractGenericJob()
  }

  return {
    platform,
    jobText: jobText.trim(),
    url: window.location.href,
  }
}

function extractUpworkJob() {
  // Upwork-specific selectors
  const title = document.querySelector('h1.job-title, [data-test="JobTitle"]')?.textContent || ''
  const description = document.querySelector('[data-test="JobDescription"], .job-description')?.textContent || ''
  const skills = Array.from(document.querySelectorAll('.skills, [data-test="Skills"]')).map(el => el.textContent).join(', ')
  
  return `${title}\n\n${description}\n\nRequired Skills: ${skills}`
}

function extractThumbtackJob() {
  // Thumbtack-specific selectors
  const title = document.querySelector('h1, .job-title')?.textContent || ''
  const description = document.querySelector('.job-description, .description')?.textContent || ''
  
  return `${title}\n\n${description}`
}

function extractFiverrJob() {
  // Fiverr-specific selectors
  const title = document.querySelector('h1, .gig-title')?.textContent || ''
  const description = document.querySelector('.gig-description, .description')?.textContent || ''
  
  return `${title}\n\n${description}`
}

function extractHouzzJob() {
  // Houzz-specific selectors
  const title = document.querySelector('h1, .project-title')?.textContent || ''
  const description = document.querySelector('.project-description, .description')?.textContent || ''
  
  return `${title}\n\n${description}`
}

function extractGenericJob() {
  // Generic extraction - try common selectors
  const title = document.querySelector('h1')?.textContent || ''
  const description = document.querySelector('article, .content, .description, .job-description, main')?.textContent || ''
  
  return `${title}\n\n${description}`
}

