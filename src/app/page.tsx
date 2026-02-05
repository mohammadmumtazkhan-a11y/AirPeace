'use client';

import { useState } from 'react';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';
import { DesktopBlocker } from '@/components/DesktopBlocker';
import { MobileFlow } from '@/components/MobileFlow';
import { mockIncomingData } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function Home() {
    const { isMobile, isDesktop, isLoading } = useDeviceDetect();
    const [hasSelectedPayment, setHasSelectedPayment] = useState(false);
    const [bypassDesktop, setBypassDesktop] = useState(false);

    // Loading state while detecting device
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-airpeace-blue animate-spin" />
                    <p className="text-slate-500">Loading payment portal...</p>
                </div>
            </div>
        );
    }

    // 1. PAYMENT METHOD SELECTION (Common to Mobile & Desktop)
    if (!hasSelectedPayment) {
        const { PaymentSelection } = require('@/components/screens/PaymentSelection');
        return (
            <PaymentSelection
                onSelectMethod={(methodId: string) => {
                    // Allow 'transfer' OR 'mito' (Pay by Bank) to trigger the demo flow
                    if (methodId === 'transfer' || methodId === 'mito') {
                        setHasSelectedPayment(true);
                    } else {
                        alert("This prototype designed for 'Pay by Bank' or 'Transfer' flows only.");
                    }
                }}
            />
        );
    }

    // 2. DESKTOP ONLY: QR Code Gate (The "Desktop Blocker")
    if (isDesktop && !bypassDesktop) {
        return (
            <DesktopBlocker
                paymentData={mockIncomingData}
                onContinue={() => setBypassDesktop(true)}
            />
        );
    }

    // MOBILE FLOW (or Bypassed Desktop):
    const content = <MobileFlow paymentData={mockIncomingData} />;

    // Wrap in simulator if on desktop
    if (isDesktop) {
        // Dynamically import wrapper only on client/desktop to avoid hydration mismatch potentially
        // But for now, simple conditional render is fine
        const { MobileSimulatorWrapper } = require('@/components/MobileSimulatorWrapper');
        return <MobileSimulatorWrapper>{content}</MobileSimulatorWrapper>;
    }

    return content;
}
