// ==UserScript==
// @name         GitHub Mobile & Safari Enhancer (Safe Version)
// @namespace    http://tampermonkey.net/
// @version      3.2
// @description  Optimizes code layout, safe selection, adds double-tap copy, auto-expands diffs. Won't break site layouts.
// @author       You
// @match        *://github.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // --- Clean, Safe CSS ---
    const style = document.createElement('style');
    style.textContent = `
        /* Safe mobile momentum scrolling without forcing layout overrides */
        html, body { -webkit-overflow-scrolling: touch !important; }
        
        .blob-code-inner, pre, code {
            white-space: pre-wrap !important;
            word-break: break-all !important;
            user-select: auto !important;
            -webkit-user-select: auto !important;
        }

        @media (max-width: 768px) {
            .repository-content { padding: 0 !important; }
            .Box-body { padding: 6px !important; }
            .blob-code-inner, pre { font-size: 13px !important; }
        }

        .copy-flash { transition: background-color 0.15s ease; background-color: #2ea44f !important; }
    `;
    (document.head || document.documentElement).appendChild(style);

    // --- Selective Event Restoration ---
    function unlockCodeBlocks() {
        document.querySelectorAll('pre, .blob-code-inner, .highlight, code').forEach(block => {
            block.style.userSelect = 'auto';
            block.style.webkitUserSelect = 'auto';
        });
    }

    // --- Double Tap Copy (Non-Invasive) ---
    document.addEventListener('dblclick', e => {
        const codeBlock = e.target.closest('pre, .blob-code-inner, code');
        if (!codeBlock) return;

        const text = codeBlock.innerText.trim();
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            codeBlock.classList.add('copy-flash');
            setTimeout(() => {
                codeBlock.classList.remove('copy-flash');
            }, 300);
        }).catch(err => console.error('Copy failed:', err));

        // REMOVED: stopImmediatePropagation() so normal word-highlighting still works!
    }, false); // Changed to false (bubbling) so it plays nice with the page

    // --- Auto Expand Diffs ---
    function expandDiffs() {
        document.querySelectorAll('.load-diff-button').forEach(btn => {
            if (btn.offsetParent !== null) btn.click(); 
        });
    }

    // --- Lightweight Observer ---
    const observer = new MutationObserver(() => {
        unlockCodeBlocks();
        expandDiffs();
    });

    function init() {
        unlockCodeBlocks();
        expandDiffs();
        observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
