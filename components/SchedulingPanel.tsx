
import React, { useState } from 'react';
import { CalendarIcon, ClockIcon, LinkIcon, ShareIcon, SparklesIcon, ShieldCheckIcon } from './icons';
import { ComplianceSettings } from '../types';

interface SchedulingPanelProps {
    complianceSettings: ComplianceSettings;
    setComplianceSettings: React.Dispatch<React.SetStateAction<ComplianceSettings>>;
    bestTimeSuggestion: string | null;
}

const Toggle: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <button
            onClick={() => onChange(!enabled)}
            className={`${
            enabled ? 'bg-brand-secondary' : 'bg-gray-600'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-gray-900`}
            role="switch"
            aria-checked={enabled}
        >
            <span
            aria-hidden="true"
            className={`${
                enabled ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    </div>
);


export const SchedulingPanel: React.FC<SchedulingPanelProps> = ({ complianceSettings, setComplianceSettings, bestTimeSuggestion }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('10:00');
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleSchedule = () => {
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);
    };
    
    const applyAISuggestion = () => {
        if(bestTimeSuggestion) {
            // E.g. "Friday at 2:00 PM"
            const timeMatch = bestTimeSuggestion.match(/(\d{1,2}:\d{2})\s*(AM|PM)/i);
            if (timeMatch) {
                let [_, timeStr, period] = timeMatch;
                let [hours, minutes] = timeStr.split(':').map(Number);
                if (period.toUpperCase() === 'PM' && hours < 12) {
                    hours += 12;
                }
                if (period.toUpperCase() === 'AM' && hours === 12) {
                    hours = 0;
                }
                const formattedTime = `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`;
                setTime(formattedTime);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <LinkIcon className="w-6 h-6 mr-2 text-brand-secondary" />
                    Connect Accounts
                </h2>
                <p className="text-sm text-gray-400 mb-4">Scan the QR code with your phone to securely link your social media accounts.</p>
                <div className="bg-white p-2 rounded-lg max-w-[180px] mx-auto">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://example.com/connect-social" alt="QR Code for connecting social media" />
                </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <ShieldCheckIcon className="w-6 h-6 mr-2 text-brand-secondary" />
                    Compliance & Safety
                </h2>
                <div className="space-y-3">
                    <Toggle label="Add Watermark" enabled={complianceSettings.addWatermark} onChange={(val) => setComplianceSettings(p => ({...p, addWatermark: val}))} />
                    <Toggle label="Include AI Disclosure" enabled={complianceSettings.includeDisclosure} onChange={(val) => setComplianceSettings(p => ({...p, includeDisclosure: val}))} />
                </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <CalendarIcon className="w-6 h-6 mr-2 text-brand-secondary" />
                    Schedule Post
                </h2>

                {bestTimeSuggestion && (
                     <button onClick={applyAISuggestion} className="w-full text-left bg-gradient-to-r from-brand-secondary/20 to-brand-accent/20 p-3 mb-4 rounded-lg border border-blue-500/30 hover:border-blue-500/60 transition">
                        <h3 className="font-bold text-white flex items-center text-sm"><SparklesIcon className="w-4 h-4 mr-1.5 text-yellow-400"/>AI Suggestion</h3>
                        <p className="text-blue-200 text-sm mt-1">Post on <span className="font-bold">{bestTimeSuggestion}</span> for max reach. Click to apply.</p>
                    </button>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-400 mb-1 flex items-center"><CalendarIcon className="w-4 h-4 mr-1.5" /> Date</label>
                        <input
                            type="date" id="schedule-date" value={date} onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="schedule-time" className="block text-sm font-medium text-gray-400 mb-1 flex items-center"><ClockIcon className="w-4 h-4 mr-1.5" /> Time</label>
                        <input
                            type="time" id="schedule-time" value={time} onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition"
                        />
                    </div>
                </div>
                <button
                    onClick={handleSchedule}
                    className="w-full mt-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                >
                    <ShareIcon className="w-5 h-5 mr-2" />
                    Schedule Post
                </button>
                {showConfirmation && (
                    <p className="text-center text-green-400 text-sm mt-4 animate-fade-in">Post scheduled successfully!</p>
                )}
            </div>
        </div>
    );
};
