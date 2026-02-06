'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2, ChevronDown, X } from 'lucide-react';
import { Input } from './Input';

// Mock UK postcode database for demo
const MOCK_POSTCODES: Record<string, { street: string; city: string; county?: string }[]> = {
    'SW1A 1AA': [
        { street: 'Buckingham Palace', city: 'London', county: 'Westminster' },
    ],
    'EC1A 1BB': [
        { street: 'St Bartholomew\'s Hospital', city: 'London', county: 'City of London' },
    ],
    'W1A 0AX': [
        { street: 'BBC Broadcasting House', city: 'London', county: 'Westminster' },
    ],
    'E1 6AN': [
        { street: 'Whitechapel Road', city: 'London', county: 'Tower Hamlets' },
        { street: 'Commercial Road', city: 'London', county: 'Tower Hamlets' },
        { street: 'Mile End Road', city: 'London', county: 'Tower Hamlets' },
    ],
    'M1 1AE': [
        { street: 'Piccadilly Gardens', city: 'Manchester', county: 'Greater Manchester' },
        { street: 'Market Street', city: 'Manchester', county: 'Greater Manchester' },
    ],
    'B1 1AA': [
        { street: 'Victoria Square', city: 'Birmingham', county: 'West Midlands' },
        { street: 'New Street', city: 'Birmingham', county: 'West Midlands' },
    ],
    'LS1 1UR': [
        { street: 'Briggate', city: 'Leeds', county: 'West Yorkshire' },
        { street: 'The Headrow', city: 'Leeds', county: 'West Yorkshire' },
    ],
};

// Generate suggestions for partial postcodes
function getSuggestions(partial: string): string[] {
    const normalized = partial.toUpperCase().replace(/\s/g, '');
    if (normalized.length < 2) return [];

    return Object.keys(MOCK_POSTCODES).filter(postcode =>
        postcode.replace(/\s/g, '').startsWith(normalized)
    ).slice(0, 5);
}

interface AddressResult {
    houseNumber: string;
    street: string;
    city: string;
    postalCode: string;
}

interface PostcodeLookupProps {
    onAddressSelect: (result: AddressResult) => void;
    initialPostcode?: string;
    initialHouseNumber?: string;
    disabled?: boolean;
}

export function PostcodeLookup({
    onAddressSelect,
    initialPostcode = '',
    initialHouseNumber = '',
    disabled = false,
}: PostcodeLookupProps) {
    const [postcode, setPostcode] = useState(initialPostcode);
    const [houseNumber, setHouseNumber] = useState(initialHouseNumber);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [addresses, setAddresses] = useState<{ street: string; city: string }[]>([]);
    const [selectedStreet, setSelectedStreet] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showAddresses, setShowAddresses] = useState(false);
    const [manualMode, setManualMode] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle postcode input change
    const handlePostcodeChange = useCallback((value: string) => {
        const formatted = value.toUpperCase();
        setPostcode(formatted);
        setSelectedStreet(null);
        setAddresses([]);

        const newSuggestions = getSuggestions(formatted);
        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0 && formatted.length >= 2);
    }, []);

    // Lookup addresses for a postcode
    const lookupPostcode = useCallback(async (pc: string) => {
        setIsSearching(true);
        setShowSuggestions(false);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const normalized = pc.toUpperCase().replace(/\s+/g, ' ').trim();
        const found = MOCK_POSTCODES[normalized];

        if (found) {
            setAddresses(found);
            setShowAddresses(true);
        } else {
            setAddresses([]);
            setShowAddresses(false);
        }

        setIsSearching(false);
    }, []);

    // Select a postcode suggestion
    const handleSelectSuggestion = useCallback((pc: string) => {
        setPostcode(pc);
        setShowSuggestions(false);
        lookupPostcode(pc);
    }, [lookupPostcode]);

    // Select an address from results
    const handleSelectAddress = useCallback((street: string, city: string) => {
        setSelectedStreet(street);
        setShowAddresses(false);

        // Notify parent with complete address
        if (houseNumber) {
            onAddressSelect({
                houseNumber,
                street,
                city,
                postalCode: postcode,
            });
        }
    }, [houseNumber, postcode, onAddressSelect]);

    // Update parent when house number changes
    useEffect(() => {
        if (selectedStreet && houseNumber) {
            const found = addresses.find(a => a.street === selectedStreet);
            if (found) {
                onAddressSelect({
                    houseNumber,
                    street: selectedStreet,
                    city: found.city,
                    postalCode: postcode,
                });
            }
        }
    }, [houseNumber, selectedStreet, addresses, postcode, onAddressSelect]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = () => {
            setShowSuggestions(false);
            setShowAddresses(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    if (manualMode) {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Enter Address Manually</span>
                    <button
                        type="button"
                        onClick={() => setManualMode(false)}
                        className="text-xs text-airpeace-blue hover:text-airpeace-navy"
                    >
                        Use postcode lookup
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3" onClick={e => e.stopPropagation()}>
            {/* Postcode Input with Suggestions */}
            <div className="relative">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Input
                            ref={inputRef}
                            label="Postcode"
                            value={postcode}
                            onChange={(e) => handlePostcodeChange(e.target.value)}
                            placeholder="e.g. SW1A 1AA"
                            disabled={disabled}
                        />

                        {/* Suggestions Dropdown */}
                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="absolute z-20 left-0 right-0 top-full mt-1 bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden"
                                >
                                    {suggestions.map((pc) => (
                                        <button
                                            key={pc}
                                            type="button"
                                            onClick={() => handleSelectSuggestion(pc)}
                                            className="w-full px-3 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-2"
                                        >
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            <span className="font-mono text-sm">{pc}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        type="button"
                        onClick={() => lookupPostcode(postcode)}
                        disabled={disabled || postcode.length < 3 || isSearching}
                        className="mt-6 px-4 h-[42px] bg-airpeace-blue text-white rounded-lg hover:bg-airpeace-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSearching ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Search className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Address Results Dropdown */}
                <AnimatePresence>
                    {showAddresses && addresses.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="absolute z-20 left-0 right-0 top-full mt-1 bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden"
                        >
                            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                                <span className="text-xs font-medium text-slate-500">Select your street</span>
                            </div>
                            {addresses.map((addr, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectAddress(addr.street, addr.city)}
                                    className="w-full px-3 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                >
                                    <span className="text-sm text-slate-900">{addr.street}</span>
                                    <span className="text-xs text-slate-500 ml-2">{addr.city}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* House Number Input (shown after street is selected) */}
            {selectedStreet && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                >
                    <Input
                        label="House/Flat Number"
                        value={houseNumber}
                        onChange={(e) => setHouseNumber(e.target.value)}
                        placeholder="e.g. 42 or Flat 3B"
                        disabled={disabled}
                    />

                    {/* Selected Address Preview */}
                    <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-green-800">
                                    {houseNumber ? `${houseNumber}, ` : ''}{selectedStreet}
                                </p>
                                <p className="text-green-600">
                                    {addresses.find(a => a.street === selectedStreet)?.city}, {postcode}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Manual entry fallback */}
            {!selectedStreet && !showAddresses && (
                <button
                    type="button"
                    onClick={() => setManualMode(true)}
                    className="text-xs text-slate-500 hover:text-airpeace-blue transition-colors"
                >
                    Can&apos;t find your address? Enter manually
                </button>
            )}
        </div>
    );
}
