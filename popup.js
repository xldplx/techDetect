// This script runs when the popup is opened.

// A library of tech info, including an SVG icon and a theme color.
const TECH_INFO = {
    'React': {
        color: 'bg-cyan-100 text-cyan-800',
        icon: `<svg viewBox="0 0 1024 1024" fill="currentColor" height="1.5em" width="1.5em"><path d="M640.96 512c0 141.376-114.624 256-256 256s-256-114.624-256-256 114.624-256 256-256 256 114.624 256 256z m-256-192c-106.048 0-192 85.952-192 192s85.952 192 192 192 192-85.952 192-192-85.952-192-192-192z m394.048-112.448l33.92-58.752c-42.368-24.448-91.264-39.232-144.384-43.904l-14.016 62.912c44.8 8.832 84.8 23.04 120.448 42.624z m-599.424 532.8l-33.856 58.752c42.368 24.448 91.264 39.232 144.384 43.904l14.016-62.912c-44.8-8.832-84.8-23.04-120.512-42.624z m-165.952-250.752l-62.912-14.016c-8.832-44.8-23.04-84.8-42.624-120.448l58.688-33.92c24.448 42.368 39.232 91.264 43.904 144.384z m731.328 165.952l-58.752-33.856c-24.448-42.368-39.232-91.264-43.904-144.384l62.912-14.016c8.832 44.8 23.04 84.8 42.624 120.448z m-165.952-411.328l58.688 33.92c-24.448 42.368-39.232 91.264-43.904 144.384l-62.912 14.016c-8.832-44.8-23.04-84.8-42.624-120.448z m-411.328 165.952l-58.752 33.856c24.448 42.368 39.232 91.264 43.904 144.384l62.912-14.016c-8.832-44.8-23.04-84.8-42.624-120.448z"></path></svg>`
    },
    'Vue.js': {
        color: 'bg-green-100 text-green-800',
        icon: `<svg viewBox="0 0 256 221" fill="currentColor" height="1.5em" width="1.5em"><path d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0h47.36z"></path><path d="M0 0l128 220.8L256 0h-51.2L128 132.48 50.56 0H0z"></path></svg>`
    },
    'Angular': {
        color: 'bg-red-100 text-red-800',
        icon: `<svg viewBox="0 0 250 250" fill="currentColor" height="1.5em" width="1.5em"><path d="M125 0L25 40v150l100 60 100-60V40L125 0zm75 180l-75 45-75-45V60l75-45 75 45v120z"></path><path d="M125 29.5l-68.5 41v109l68.5 41 68.5-41v-109L125 29.5zm42.5 141L125 194l-42.5-23.5v-83L125 64l42.5 23.5v83z"></path><path d="M125 112.5H82.5V89h85v23.5H125v23h23v23h-23v23h-23.5v-23h-23v-23h23v-23z"></path></svg>`
    },
    // Add other techs here...
    'Default': {
        color: 'bg-gray-100 text-gray-800',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`
    }
};


// Main function to run when the popup's DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
    // Get references to our UI elements.
    const loadingView = document.getElementById('loading');
    const techListView = document.getElementById('tech-list');
    const emptyStateView = document.getElementById('empty-state');

    // Start by querying for the active tab.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        // Ensure we have a valid tab with a URL that can be scripted.
        if (activeTab && activeTab.id && activeTab.url.startsWith('http')) {
            // Execute the content script in the active tab.
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ['content.js']
            });
        } else {
            // Handle cases where the tab can't be scripted (e.g., chrome:// pages).
            loadingView.style.display = 'none';
            emptyStateView.style.display = 'block';
            emptyStateView.querySelector('p.font-semibold').textContent = 'Cannot analyze this page.';
            emptyStateView.querySelector('p.text-sm').textContent = 'Extensions cannot run on special browser pages.';
        }
    });

    // Listen for the message from the content script.
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // We only care about messages of type 'tech_stack'.
        if (message.type === 'tech_stack' && message.stack) {
            // Hide the loading spinner.
            loadingView.style.display = 'none';
            
            // Clear any previous results to prevent duplicates.
            techListView.innerHTML = ''; 

            if (message.stack.length > 0) {
                // If we found technologies, display them.
                displayTechList(message.stack);
            } else {
                // Otherwise, show the empty state message.
                techListView.style.display = 'none';
                emptyStateView.style.display = 'block';
            }
        }
    });

    // This function takes the array of found technologies and renders them to the UI.
    function displayTechList(stack) {
        techListView.style.display = 'block';
        emptyStateView.style.display = 'none';

        stack.forEach(techName => {
            const tech = TECH_INFO[techName] || TECH_INFO['Default'];
            
            const li = document.createElement('li');
            li.className = `flex items-center p-3 rounded-lg transition-all duration-200 ease-in-out ${tech.color} hover:shadow-md hover:scale-105`;

            const iconDiv = document.createElement('div');
            iconDiv.className = 'w-6 h-6 mr-3 flex-shrink-0';
            iconDiv.innerHTML = tech.icon;

            const textSpan = document.createElement('span');
            textSpan.className = 'font-semibold';
            textSpan.textContent = techName;

            li.appendChild(iconDiv);
            li.appendChild(textSpan);
            techListView.appendChild(li);
        });
    }
});

