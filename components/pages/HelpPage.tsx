import React, { useState } from 'react';

const faqs = [
  { q: "How is my overall score calculated?", a: "Your overall score is a weighted average of your performance across various quantitative and qualitative Key Performance Indicators (KPIs). Each KPI has a specific weight, and your score is calculated based on your achievements against the set targets." },
  { q: "Can I appeal a score I disagree with?", a: "Yes, you can submit an appeal through the 'Appeals' section in the sidebar. Please provide detailed reasons and any supporting evidence for our review." },
  { q: "How often is the dashboard data updated?", a: "The dashboard is updated in real-time as new data from integrated systems becomes available. A notification will appear at the bottom right of your screen when an update occurs." },
];

const HelpPage: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Support ticket submitted!\nSubject: ${subject}\nMessage: ${message}`);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-brand-dark">Help & Support</h2>

      {/* FAQ Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-brand-dark mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="group border-b pb-2">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                <span>{faq.q}</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-3 group-open:animate-fadeIn">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-brand-dark mb-4">Contact Support</h3>
        <p className="text-gray-600 mb-4">If you can't find an answer in the FAQ, please fill out the form below to contact our support team.</p>
        <form className="space-y-4" onSubmit={handleSupportSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input 
              type="text" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent" placeholder="e.g., Issue with file upload"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea 
              rows={4} 
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent" placeholder="Describe your issue in detail..."></textarea>
          </div>
          <div className="text-right">
            <button type="submit" className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Submit Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HelpPage;
