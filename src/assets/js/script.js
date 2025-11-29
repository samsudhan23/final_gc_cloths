// Use event delegation to handle dynamically added buttons
function initTruckButton(button) {
    if (!button || button.dataset.initialized === 'true') {
        return; // Already initialized or invalid
    }
    
    // Skip if button is manually controlled by Angular
    if (button.dataset.manualControl === 'true') {
        return;
    }
    
    button.dataset.initialized = 'true';
    
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        let box = button.querySelector('.box'),
            truck = button.querySelector('.truck');
        
        if(!button.classList.contains('done')) {
            
            if(!button.classList.contains('animation')) {

                button.classList.add('animation');

                if (typeof gsap !== 'undefined') {
                    gsap.to(button, {
                        '--box-s': 1,
                        '--box-o': 1,
                        duration: .3,
                        delay: .5
                    });

                    gsap.to(box, {
                        x: 0,
                        duration: .4,
                        delay: .7
                    });

                    gsap.to(button, {
                        '--hx': -5,
                        '--bx': 50,
                        duration: .18,
                        delay: .92
                    });

                    gsap.to(box, {
                        y: 0,
                        duration: .1,
                        delay: 1.15
                    });

                    gsap.set(button, {
                        '--truck-y': 0,
                        '--truck-y-n': -26
                    });

                    gsap.to(button, {
                        '--truck-y': 1,
                        '--truck-y-n': -25,
                        duration: .2,
                        delay: 1.25,
                        onComplete() {
                            gsap.timeline({
                                onComplete() {
                                    button.classList.add('done');
                                }
                            }).to(truck, {
                                x: 0,
                                duration: .4
                            }).to(truck, {
                                x: 40,
                                duration: 1
                            }).to(truck, {
                                x: 20,
                                duration: .6
                            }).to(truck, {
                                x: 96,
                                duration: .4
                            });
                            gsap.to(button, {
                                '--progress': 1,
                                duration: 2.4,
                                ease: "power2.in"
                            });
                        }
                    });
                }
                
            }
            
        } else {
            button.classList.remove('animation', 'done');
            if (typeof gsap !== 'undefined') {
                gsap.set(truck, {
                    x: 4
                });
                gsap.set(button, {
                    '--progress': 0,
                    '--hx': 0,
                    '--bx': 0,
                    '--box-s': .5,
                    '--box-o': 0,
                    '--truck-y': 0,
                    '--truck-y-n': -26
                });
                gsap.set(box, {
                    x: -24,
                    y: -6
                });
            }
        }
    });
}

// Initialize existing buttons on page load
document.querySelectorAll('.truck-button').forEach(button => {
    initTruckButton(button);
});

// Use MutationObserver to watch for dynamically added buttons
if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    // Check if the added node is a truck-button
                    if (node.classList && node.classList.contains('truck-button')) {
                        initTruckButton(node);
                    }
                    // Check for truck-button descendants
                    const truckButtons = node.querySelectorAll && node.querySelectorAll('.truck-button');
                    if (truckButtons) {
                        truckButtons.forEach(function(button) {
                            initTruckButton(button);
                        });
                    }
                }
            });
        });
    });

    // Start observing when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    } else {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Expose initTruckButton globally so Angular components can call it manually
if (typeof window !== 'undefined') {
    window.initTruckButton = initTruckButton;
}