// ==UserScript==
// @name         GitHub Mobile & Safari Enhancer + Unlocker
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Optimizes code layout, unlocks scroll/copy restrictions, adds double-tap copy, and auto-expands hidden code.
// @author       You
// @match        *://github.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    
    // --- FEATURE 1: Mobile UI, Code Wrapping & Scroll Forcing CSS ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* Force scrollability on the entire page */
        html, body {
            overflow: auto !important;
            overflow-x: auto !important;
            overflow-y: auto !important;
            position: relative !important;
            -webkit-overflow-scrolling: touch !important;
        }

        /* Force selection to be allowed everywhere */
        * {
            -webkit-user-select: auto !important;
            -moz-user-select: auto !important;
            -ms-user-select: auto !important;
            user-select: auto !important;
        }

        @media (max-width: 768px) {
            /* Removes excessive padding to maximize screen space */
            .repository-content { padding: 0 !important; }
            .Box-body { padding: 4px !important; }
            
            /* Wraps code to eliminate sideways scrolling */
            .blob-code-inner, pre { 
                white-space: pre-wrap !important; 
                word-break: break-all !important; 
                font-size: 13px !important; 
            }
        }

        /* Smooth transition for the copy flash effect */
        .copy-flash {
            opacity: 0.3;
            transition: opacity 0.1s ease-in-out;
        }
    `;
    
    // Inject style as early as possible
    if (document.head) {
        document.head.appendChild(style);
    } else {
        document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
    }

    // --- FEATURE 2: Intercept & Kill Scroll/Copy Restrictions ---
    const restoreEvents = () => {
        const restrictedEvents = [
            'contextmenu', 'copy', 'cut', 'paste', 
            'selectstart', 'dragstart', 'mousedown', 'mouseup', 'keydown'
        ];

        restrictedEvents.forEach(eventType => {
            document.addEventListener(eventType, function(e) {
                e.stopPropagation();
            }, true); // Intercepts and stops the site from blocking your actions
        });
    };

    const forceScrollability = () => {
        if (document.body) {
            document.body.style.setProperty('overflow', 'auto', 'important');
        }
        if (document.documentElement) {
            document.documentElement.style.setProperty('overflow', 'auto', 'important');
        }
    };

    // Run event restore immediately
    restoreEvents();

    // --- FEATURE 3: Double-Tap/Click to Copy Code ---
    document.addEventListener('dblclick', function(e) {
        const codeBlock = e.target.closest('pre, .blob-code-inner');
        
        if (codeBlock) {
            navigator.clipboard.writeText(codeBlock.innerText).then(() => {
                codeBlock.classList.add('copy-flash');
                setTimeout(() => codeBlock.classList.remove('copy-flash'), 200);
            }).catch(err => {
                console.error("Failed to copy code: ", err);
            });
            
            e.preventDefault(); 
        }
    });

    // --- FEATURE 4: Auto-Expand Hidden Diffs in PRs ---
    const autoLoadDiffs = () => {
        const loadButtons = document.querySelectorAll('.load-diff-button');
        loadButtons.forEach(btn => {
            if (btn && btn.style.display !== 'none') {
                btn.click();
            }
        });
    };

    // Loop to continuously ensure scrolling is unfrozen and files are expanded
    document.addEventListener('DOMContentLoaded', () => {
        setInterval(() => {
            forceScrollability();
            autoLoadDiffs();
        }, 1500);
    });

})();
