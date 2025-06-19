// This script is injected into the webpage to detect technologies.
// It runs in an isolated environment but has access to the page's DOM and window object.

(function() {
    // This function runs the detection logic. We wrap it to use async/await
    // for potential future async checks, though none are used currently.
    const detectTechnologies = async () => {
        // A more robust dictionary of detection rules.
        // We check for dev tools hooks, global variables, and specific DOM element attributes.
        const detections = {
            'React': () => !!window.React || !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || !!document.querySelector('[data-reactroot], [data-reactid]'),
            'Vue.js': () => !!window.Vue || !!window.__VUE__ || !!window.__VUE_DEVTOOLS_GLOBAL_HOOK__ || !!document.querySelector('[data-v-app], #__vue-app'),
            'Angular': () => !!window.angular || document.querySelector('.ng-version, [ng-version], [ng-app]'),
            'Svelte': () => !!window.__SVELTE_DEVTOOLS_GLOBAL_HOOK__ || document.querySelector('[class*="svelte-"]'),
            'Next.js': () => !!window.__NEXT_DATA__ || !!document.getElementById('__next'),
            'Nuxt.js': () => !!window.__NUXT__ || !!document.getElementById('__nuxt'),
            'jQuery': () => !!window.jQuery,
            'WordPress': () => {
                const generator = document.querySelector('meta[name=generator]');
                const hasWPGenerator = generator ? generator.content.toLowerCase().includes('wordpress') : false;
                const hasWPLinks = Array.from(document.querySelectorAll('link, script')).some(el => (el.src || el.href).includes('/wp-content/'));
                return hasWPGenerator || hasWPLinks;
            },
            'Shopify': () => !!window.Shopify,
            'Bootstrap': () => (typeof $ !== 'undefined' && $.fn && $.fn.modal) || document.querySelector('link[href*="bootstrap"], script[src*="bootstrap"]'),
            'Tailwind CSS': () => document.querySelector('style[id="tailwind-style"], link[href*="tailwind"]'),
        };

        const foundTech = [];

        // Iterate over our detection rules and check which ones pass.
        for (const tech in detections) {
            try {
                if (detections[tech]()) {
                    foundTech.push(tech);
                }
            } catch (e) {
                // Errors can happen on pages with strict security policies.
                // We'll just log them to the console and continue.
                console.error(`Tech-Detector: Error detecting ${tech}:`, e);
            }
        }

        // Send the list of found technologies back to our popup script.
        chrome.runtime.sendMessage({
            type: 'tech_stack',
            stack: foundTech
        });
    };

    // Run the detection.
    detectTechnologies();
})();
