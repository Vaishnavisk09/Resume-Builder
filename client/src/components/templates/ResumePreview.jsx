import React from 'react';
import { createRoot } from 'react-dom/client';
import { getTemplate } from './ResumeTemplates';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export const ResumePreviewPanel = ({ data, scale = 0.65 }) => {
  const { Component } = getTemplate(data?.selectedTemplate || 'modern');

  return (
    <div
      className="resume-page a4-preview bg-white overflow-hidden"
      style={{
        width: '210mm',
        minHeight: '297mm',
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
      }}
    >
      <Component data={data} />
    </div>
  );
};

export const useResumeExport = () => {
  const downloadPDF = async (data) => {
    const toastId = toast.loading('Generating PDF...');
    try {
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed; left: -9999px; top: 0;
        width: 794px; background: white; z-index: -1;
      `;
      document.body.appendChild(container);

      const { Component } = getTemplate(data?.selectedTemplate || 'modern');
      const root = createRoot(container);
      root.render(
        <div style={{ width: '794px', background: 'white', fontFamily: "'Inter', sans-serif" }}>
          <Component data={data} />
        </div>
      );

      // Allow React to render
      await new Promise(r => setTimeout(r, 800));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgAspect = canvas.height / canvas.width;
      const imgHeightOnPage = pdfWidth * imgAspect;

      if (imgHeightOnPage <= pdfHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeightOnPage);
      } else {
        let y = 0;
        while (y < canvas.height) {
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(canvas.width * (pdfHeight / pdfWidth), canvas.height - y);
          const ctx = pageCanvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, -y);
          const pageData = pageCanvas.toDataURL('image/jpeg', 0.95);
          if (y > 0) pdf.addPage();
          pdf.addImage(pageData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          y += pageCanvas.height;
        }
      }

      const fileName = `${data?.title || 'resume'}_${data?.selectedTemplate || 'modern'}.pdf`;
      pdf.save(fileName.replace(/\s+/g, '_').toLowerCase());

      root.unmount();
      document.body.removeChild(container);
      toast.success('PDF downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Failed to generate PDF. Please try again.', { id: toastId });
    }
  };

  return { downloadPDF };
};
