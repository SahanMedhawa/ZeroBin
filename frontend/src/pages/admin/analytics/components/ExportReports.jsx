import React from 'react';
import { ReportService } from '../services/reportService';
import { toast } from 'react-toastify';

const ExportReports = ({ analytics, areaAnalytics }) => {
  const handleExportReport = (reportType) => {
    try {
      const message = ReportService.generateReport(reportType, analytics, areaAnalytics);
      toast.success(message);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  const reportTypes = [
    {
      type: 'Sensor Data',
      title: 'Sensor Data Report',
      description: 'Fill levels and sensor metrics',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    },
    {
      type: 'Area Analysis',
      title: 'Area Analysis Report',
      description: 'Performance by service area',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      gradient: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
    },
    {
      type: 'System Performance',
      title: 'System Performance',
      description: 'Overall system metrics',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Export Analytics Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <button
            key={report.type}
            onClick={() => handleExportReport(report.type)}
            className={`p-4 bg-gradient-to-r ${report.gradient} text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3`}
          >
            {report.icon}
            <div>
              <h4 className="font-semibold">{report.title}</h4>
              <p className="text-sm opacity-90">{report.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExportReports;
