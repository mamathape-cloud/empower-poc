'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ResultsPage() {
  const [data, setData] = useState<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('empowerResults');
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        // bad data
      }
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium">No results yet.</p>
        <Link href="/" className="text-blue-600 underline">
          Go back and fill in the form
        </Link>
      </div>
    );
  }

  const { intake, claudeAlone, claudeTraining, empower } = data;

  return (
    <div className="min-h-screen bg-[#F4F6FA] p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="text-sm text-blue-600 underline mb-4 inline-block">
          ← Try another goal
        </Link>
        <h1 className="text-3xl font-bold text-[#1F3A5F] mb-1">Your AI plan</h1>
        <p className="italic text-gray-500 mb-8">{intake?.goal}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Column 1 —ude alone */}
          <div className="bg-white rounded-xl shadow p-6">
            <span className="inline-block bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full mb-1">Claude alone</span>
            <p className="text-xs text-gray-400 mb-4">No context, no plan — just a chat answer</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{claudeAlone}</p>
          </div>

          {/* Column 2 — Claude free training */}
          <div className="bg-white rounded-xl shadow p-6">
            <span className="inline-block bg-[#2E75B6] text-white text-xs font-semibold px-3 py-1 rounded-full mb-1">Claude free training</span>
            <p className="text-xs text-gray-400 mb-4">Generic fluency courses — not role-specific</p>
            <p className="font-bold text-sm mb-3">{claudeTraining?.headline}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">What it covers</p>
            <ul className="list-disc list-inside text-sm text-grayb-3 space-y-1">
              {claudeTraining?.what_it_covers?.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">What it does not cover</p>
            <ul className="list-disc list-inside text-sm text-red-400 mb-3 space-y-1">
              {claudeTraining?.what_it_does_not_cover?.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-sm italic text-gray-500">{claudeTraining?.bottom_line}</p>
          </div>

          {/* Column 3 — Empower AI Pathways */}
          <div className="rounded-xl shadow p-6" style={{ backgroundColor: '#E8EEF5', borderLeft: '4px solid #1F3A5F' }}>
            <span className="inline-block bg-[#1F3A5F] text-white text-xs font-semibold px-3 py-1 rounded-full mb-1">Empower AI Pathways</span>
            <p className="text-xs text-gray-400 mb-4">Grounded toour goal, your stack, your funnel</p>
            <p className="font-bold text-base mb-1">{empower?.headline}</p>
            <p className="italic text-sm text-gray-500 mb-4">{empower?.why_specific}</p>

            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Recommended tools</p>
            <table className="w-full text-sm mb-4 border-collapse">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="pb-1 pr-2">Name</th>
                  <th className="pb-1">What to use it for</th>
                </tr>
              </thead>
              <tbody>
                {empower?.top_tools?.map((t: any, i: number) => (
                  <tr key={i} className="border-t border-gray-200">
                    <td className="py-1 pr-2 font-medium">{t.name}</td>
                    <td className="py-1 text-gray-600">{t.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Automations to set up</p>
            <table className="w-full text-sm mb-4 border-collapse">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="pb-1 pr-2">Name</th>
                  <th className="pb-1 pr-2">Trigger</th>
                  <th className="pb-1">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {empower?.top_automations?.map((a: any, i: number) => (
                  <tr key={i} className="border-t border-gray-200">
                    <td className="py-1 pr-2 font-medium">{a.name}</td>
                    <td className="py-1 pr-2 text-gray-600">{a.trigger}</td>
                    <td className="py-1 text-gray-600">{a.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Week 1 actions</p>
            <ol className="list-decimal list-inside text-sm text-gray-700 mb-4 space-y-1">
              {empower?.week_1_actions?.map((action: string, i: number) => (
                <li key={i}>{action}</li>
              ))}
            </ol>

            <div style={{ backgroundColor: '#FAF7EC', borderLeft: '4px solid #D4A017' }} className="p-3 rounded">
              <p className="text-xs font-bold text-gray-600 uppercase mb-1">Expected outcome</p>
              <p className="text-sm text-gray-700">{empower?.expected_outcome}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
