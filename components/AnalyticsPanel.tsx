
import React from 'react';
import { AnalyticsData } from '../types';
import { ChartBarIcon, SparklesIcon, TrendingUpIcon, UsersIcon } from './icons';

interface AnalyticsPanelProps {
  data: AnalyticsData | null;
  isLoading: boolean;
}

const ShimmerEffect = () => (
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-gray-700/50 to-transparent animate-shimmer" />
);

const StatCardSkeleton = () => (
    <div className="relative bg-gray-800/50 p-4 rounded-xl overflow-hidden">
        <ShimmerEffect />
        <div className="h-5 w-2/3 bg-gray-700 rounded-md mb-2"></div>
        <div className="h-8 w-1/2 bg-gray-700 rounded-md"></div>
    </div>
);


const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-800/50 p-4 rounded-xl">
        <div className="flex items-center">
            <div className="p-2 bg-gray-700/50 rounded-lg mr-3 text-brand-secondary">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    </div>
);


export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
             <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                 </div>
                 <div className="relative bg-gray-800/50 p-4 rounded-xl overflow-hidden h-48">
                    <ShimmerEffect />
                 </div>
             </div>
        )
    }

    if (!data) {
        return (
            <div className="text-center py-12 text-gray-500">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-2" />
                <p>Generate content to see analytics insights.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="Engagement Rate" value={`${data.engagementRate}%`} icon={<TrendingUpIcon className="w-6 h-6"/>} />
                <StatCard title="Audience Reach" value={data.reach.toLocaleString()} icon={<UsersIcon className="w-6 h-6"/>} />
                <StatCard title="Total Clicks" value={data.clicks.toLocaleString()} icon={<div className="w-6 h-6 font-bold text-center">→</div>} />
                <StatCard title="Conversions" value={data.conversions.toLocaleString()} icon={<div className="w-6 h-6 font-bold text-center">✓</div>} />
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4">Audience Sentiment</h3>
                <div className="flex space-x-2 w-full h-8 rounded-full overflow-hidden bg-gray-700">
                    <div className="bg-green-500 h-full flex items-center justify-center text-xs font-bold" style={{width: `${data.sentiment.positive}%`}} title={`Positive: ${data.sentiment.positive}%`}>{data.sentiment.positive > 10 ? `${data.sentiment.positive}%` : ''}</div>
                    <div className="bg-gray-400 h-full flex items-center justify-center text-xs font-bold" style={{width: `${data.sentiment.neutral}%`}} title={`Neutral: ${data.sentiment.neutral}%`}>{data.sentiment.neutral > 10 ? `${data.sentiment.neutral}%` : ''}</div>
                    <div className="bg-red-500 h-full flex items-center justify-center text-xs font-bold" style={{width: `${data.sentiment.negative}%`}} title={`Negative: ${data.sentiment.negative}%`}>{data.sentiment.negative > 10 ? `${data.sentiment.negative}%` : ''}</div>
                </div>
                 <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
                    <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>Positive</div>
                    <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-gray-400 mr-1.5"></span>Neutral</div>
                    <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>Negative</div>
                </div>
            </div>
             <div className="bg-gradient-to-r from-brand-secondary/20 to-brand-accent/20 p-4 rounded-xl border border-blue-500/30">
                <h3 className="font-bold text-white flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-yellow-400"/>AI Recommendation</h3>
                <p className="text-blue-200 mt-1">For maximum engagement, the best time to post this content is <span className="font-bold">{data.bestTimeToPost}</span>.</p>
            </div>
        </div>
    );
};