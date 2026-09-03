import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const generatePdfFromElement = async (
  elementId: string,
  filename: string = 'document.pdf',
  download: boolean = true
): Promise<Blob | null> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return null;
  }

  try {
    // Generate high resolution canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    if (download) {
      pdf.save(filename);
    }

    const blob = pdf.output('blob');
    return blob;
  } catch (err) {
    console.error('PDF generation error:', err);
    return null;
  }
};

export const printElement = (elementId: string) => {
  const originalTitle = document.title;
  window.print();
  document.title = originalTitle;
};
