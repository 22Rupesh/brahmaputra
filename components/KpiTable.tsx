import React, { useState } from 'react';
import { Kpi, QualitativeKpi } from '../types';
import Modal from './Modal';

interface KpiTableProps {
    quantitativeKpis: Kpi[];
    qualitativeKpis: QualitativeKpi[];
}

const KpiTable: React.FC<KpiTableProps> = ({ quantitativeKpis = [], qualitativeKpis = [] }) => {
  const [isEvidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [evidenceContent, setEvidenceContent] = useState('');
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);

  const handleEvidenceClick = (kpiName: string, evidenceMeta?: string) => {
    setEvidenceContent(`Showing evidence for "${kpiName}". Details: ${evidenceMeta || 'Not available'}`);
    setEvidenceModalOpen(true);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      comment: { value: string };
    };
    alert(`Comment submitted: "${target.comment.value}"`);
    setCommentModalOpen(false);
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-brand-dark mb-4">Detailed KPI Breakdown (September 2024)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">KPI</th>
              <th scope="col" className="px-6 py-3">Target</th>
              <th scope="col" className="px-6 py-3">Target Score</th>
              <th scope="col" className="px-6 py-3">Actual</th>
              <th scope="col" className="px-6 py-3">Weight</th>
              <th scope="col" className="px-6 py-3">Weighted Score</th>
              <th scope="col" className="px-6 py-3">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {quantitativeKpis.map((kpi, index) => (
              <tr key={index} className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{kpi.name}</td>
                <td className="px-6 py-4">{kpi.target}</td>
                <td className="px-6 py-4">{kpi.targetScore}</td>
                <td className="px-6 py-4">{kpi.actual}</td>
                <td className="px-6 py-4">{kpi.weight}</td>
                <td className="px-6 py-4">{kpi.weightedScore}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleEvidenceClick(kpi.name, kpi.evidenceMeta)} className="font-medium text-blue-600 hover:underline">{kpi.evidence} ({kpi.evidenceMeta})</button>
                  {index === 0 && 
                    <button onClick={() => setCommentModalOpen(true)} className="ml-2 text-green-500" title="Add Comment">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-6">
            <h4 className="font-bold bg-gray-50 p-3">Qualitative (Reviewer Score) - Weight: 30</h4>
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 w-1/4"></th>
                        <th scope="col" className="px-6 py-3">Score</th>
                        <th scope="col" className="px-6 py-3">Score</th>
                        <th scope="col" className="px-6 py-3">Weight</th>
                        <th scope="col" className="px-6 py-3" colSpan={3}>Evidence</th>
                    </tr>
                </thead>
                <tbody>
                    {qualitativeKpis.map((kpi, index) => (
                        <tr key={index} className="bg-white border-b">
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{kpi.name}</td>
                            <td className="px-6 py-4">{kpi.score}</td>
                            <td className="px-6 py-4">{kpi.scoreValue}</td>
                            <td className="px-6 py-4">{kpi.weight}</td>
                            <td className="px-6 py-4" colSpan={3}>
                                <button onClick={() => handleEvidenceClick(kpi.name, kpi.evidenceMeta)} className="font-medium text-blue-600 hover:underline">{kpi.evidence} {kpi.evidenceMeta && `(${kpi.evidenceMeta})`}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
      <Modal isOpen={isEvidenceModalOpen} onClose={() => setEvidenceModalOpen(false)} title="View Evidence">
        <p>{evidenceContent}</p>
        <div className="text-right mt-4">
            <button onClick={() => setEvidenceModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors text-sm">Close</button>
        </div>
      </Modal>
      <Modal isOpen={isCommentModalOpen} onClose={() => setCommentModalOpen(false)} title="Add Comment for File Disposal Rate">
        <form onSubmit={handleAddComment}>
          <textarea name="comment" className="w-full border p-2 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent" rows={4} placeholder="Enter your comment..." required></textarea>
          <div className="text-right mt-4">
            <button type="submit" className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Submit Comment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default KpiTable;