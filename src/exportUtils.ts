import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MeetingReport } from './types';

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function exportToPDF(report: MeetingReport): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text('ZoomScribe', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('AI Meeting Transcription Report', 14, 27);

  // Meeting info
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(14, 32, pageWidth - 14, 32);

  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text(report.title, 14, 42);

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const dateStr = new Date(report.date).toLocaleString();
  doc.text(`Date: ${dateStr}`, 14, 50);
  doc.text(`Duration: ${report.duration}`, 14, 56);
  doc.text(`Meeting ID: ${report.meetingId}`, 14, 62);
  doc.text(`Participants: ${report.participants.join(', ')}`, 14, 68);

  // Summary
  let yPos = 80;
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text('Meeting Summary', 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  const summaryLines = doc.splitTextToSize(report.summary, pageWidth - 28);
  doc.text(summaryLines, 14, yPos);
  yPos += summaryLines.length * 5 + 10;

  // Action Items
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text('Action Items', 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  report.actionItems.forEach((item) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    const lines = doc.splitTextToSize(`• ${item}`, pageWidth - 28);
    doc.text(lines, 14, yPos);
    yPos += lines.length * 5 + 3;
  });
  yPos += 7;

  // Key Topics
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text('Key Topics', 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  report.keyTopics.forEach((topic) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    const lines = doc.splitTextToSize(`• ${topic}`, pageWidth - 28);
    doc.text(lines, 14, yPos);
    yPos += lines.length * 5 + 3;
  });

  // Transcript table
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text('Full Transcript (Diarized)', 14, 20);

  const tableData = report.segments.map((seg) => [
    `${formatTimestamp(seg.start)} - ${formatTimestamp(seg.end)}`,
    seg.speaker,
    seg.text,
  ]);

  autoTable(doc, {
    startY: 28,
    head: [['Time', 'Speaker', 'Text']],
    body: tableData,
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 30 },
      2: { cellWidth: 'auto' },
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 255],
    },
  });

  doc.save(`ZoomScribe_${report.meetingId}_${Date.now()}.pdf`);
}

export function exportToMarkdown(report: MeetingReport): void {
  const dateStr = new Date(report.date).toLocaleString();
  let md = `# ${report.title}\n\n`;
  md += `**Date:** ${dateStr}  \n`;
  md += `**Duration:** ${report.duration}  \n`;
  md += `**Meeting ID:** ${report.meetingId}  \n`;
  md += `**Participants:** ${report.participants.join(', ')}\n\n`;
  md += `---\n\n`;
  md += `## Meeting Summary\n\n${report.summary}\n\n`;
  md += `## Action Items\n\n`;
  report.actionItems.forEach((item) => {
    md += `- [ ] ${item}\n`;
  });
  md += `\n## Key Topics\n\n`;
  report.keyTopics.forEach((topic) => {
    md += `- ${topic}\n`;
  });
  md += `\n---\n\n## Full Transcript\n\n`;
  md += `| Time | Speaker | Text |\n|------|---------|------|\n`;
  report.segments.forEach((seg) => {
    const time = `${formatTimestamp(seg.start)}-${formatTimestamp(seg.end)}`;
    md += `| ${time} | **${seg.speaker}** | ${seg.text} |\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ZoomScribe_${report.meetingId}_${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
