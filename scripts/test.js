/**
 * Test script to verify the website meets all requirements
 */

// Function to test if an element exists
function testElementExists(selector, message) {
    const element = document.querySelector(selector);
    if (!element) {
        console.error(`❌ FAILED: ${message}`);
        return false;
    }
    console.log(`✅ PASSED: ${message}`);
    return true;
}

// Function to test navigation
function testNavigation() {
    let passed = true;
    
    // Check if main navigation exists
    passed = testElementExists('.main-nav', 'Navigation menu exists') && passed;
    
    // Check if all game links exist
    const links = document.querySelectorAll('.main-nav a');
    const requiredLinks = ['index.html', 'minesweeper.html', 'tetris.html', 'snake.html'];
    
    let allLinksExist = true;
    requiredLinks.forEach(required => {
        let found = false;
        links.forEach(link => {
            if (link.getAttribute('href') === required) {
                found = true;
            }
        });
        
        if (!found) {
            console.error(`❌ FAILED: Navigation link to ${required} is missing`);
            allLinksExist = false;
        }
    });
    
    if (allLinksExist) {
        console.log('✅ PASSED: All required navigation links exist');
    }
    
    passed = passed && allLinksExist;
    
    return passed;
}

// Function to test responsiveness
function testResponsiveness() {
    // This is a basic check, actual responsiveness would need manual testing
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport || !viewport.getAttribute('content').includes('width=device-width')) {
        console.error('❌ FAILED: Viewport meta tag for responsiveness is missing or incorrect');
        return false;
    }
    
    console.log('✅ PASSED: Viewport meta tag for responsiveness exists');
    
    // Check if we have media queries in our CSS
    const allCSS = Array.from(document.styleSheets)
        .map(sheet => {
            try {
                return Array.from(sheet.cssRules)
                    .map(rule => rule.cssText)
                    .join('\n');
            } catch (e) {
                // CORS restriction for external stylesheets
                return '';
            }
        })
        .join('\n');
    
    if (!allCSS.includes('@media')) {
        console.error('❌ FAILED: No media queries found in CSS, responsiveness may be limited');
        return false;
    }
    
    console.log('✅ PASSED: Media queries found in CSS for responsive design');
    return true;
}

// Function to test design system
function testDesignSystem() {
    let passed = true;
    
    // Check if we have CSS variables defined
    const allCSS = Array.from(document.styleSheets)
        .map(sheet => {
            try {
                return Array.from(sheet.cssRules)
                    .map(rule => rule.cssText)
                    .join('\n');
            } catch (e) {
                // CORS restriction for external stylesheets
                return '';
            }
        })
        .join('\n');
    
    if (!allCSS.includes(':root') || !allCSS.includes('--')) {
        console.error('❌ FAILED: No CSS variables found, design system may not be consistent');
        passed = false;
    } else {
        console.log('✅ PASSED: CSS variables found for design system');
    }
    
    // Check for font families
    if (!allCSS.includes('font-family')) {
        console.error('❌ FAILED: No font-family definitions found');
        passed = false;
    } else {
        console.log('✅ PASSED: Font family definitions found');
    }
    
    return passed;
}

// Function to test game structure
function testGameStructure() {
    let passed = true;
    
    // Check game cards on home page
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        passed = testElementExists('.game-cards', 'Game cards section exists') && passed;
        
        const gameCards = document.querySelectorAll('.game-card');
        if (gameCards.length < 3) {
            console.error(`❌ FAILED: Expected 3 game cards, found ${gameCards.length}`);
            passed = false;
        } else {
            console.log('✅ PASSED: All 3 game cards exist');
        }
    }
    
    // Check game pages
    if (window.location.pathname.includes('minesweeper.html') || 
        window.location.pathname.includes('tetris.html') || 
        window.location.pathname.includes('snake.html')) {
        
        passed = testElementExists('.game-container', 'Game container exists') && passed;
        passed = testElementExists('.game-header', 'Game header exists') && passed;
        passed = testElementExists('.game-board', 'Game board exists') && passed;
        passed = testElementExists('.game-instructions', 'Game instructions exist') && passed;
    }
    
    return passed;
}

// Run all tests when the page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('------------------------------------');
    console.log('RUNNING WEBSITE STRUCTURE TESTS');
    console.log('------------------------------------');
    
    let allTestsPassed = true;
    
    console.log('\n🔍 Testing Navigation:');
    allTestsPassed = testNavigation() && allTestsPassed;
    
    console.log('\n🔍 Testing Responsiveness:');
    allTestsPassed = testResponsiveness() && allTestsPassed;
    
    console.log('\n🔍 Testing Design System:');
    allTestsPassed = testDesignSystem() && allTestsPassed;
    
    console.log('\n🔍 Testing Game Structure:');
    allTestsPassed = testGameStructure() && allTestsPassed;
    
    console.log('\n------------------------------------');
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED! Website structure meets requirements.');
    } else {
        console.log('❌ SOME TESTS FAILED. See errors above.');
    }
    console.log('------------------------------------');
});
