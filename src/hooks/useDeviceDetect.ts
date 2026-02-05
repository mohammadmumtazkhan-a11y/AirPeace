'use client';

import { useState, useEffect } from 'react';

interface DeviceInfo {
    isMobile: boolean;
    isDesktop: boolean;
    isLoading: boolean;
}

export function useDeviceDetect(): DeviceInfo {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
        isMobile: false,
        isDesktop: false,
        isLoading: true,
    });

    useEffect(() => {
        const checkDevice = () => {
            // Check for mobile using multiple methods
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

            // Also check screen width for responsive testing
            const isMobileWidth = window.innerWidth < 768;

            // Consider mobile if either UA or screen width indicates mobile
            const isMobile = isMobileUA || isMobileWidth;

            setDeviceInfo({
                isMobile,
                isDesktop: !isMobile,
                isLoading: false,
            });
        };

        checkDevice();

        // Re-check on resize (for responsive testing in browser)
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    return deviceInfo;
}
