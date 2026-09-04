import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Helper to pre-convert external images to base64 data URLs to prevent CORS canvas tainting
const convertImageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!url || url.startsWith('data:')) {
      resolve(url);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const cvs = document.createElement('canvas');
        cvs.width = img.naturalWidth || img.width || 100;
        cvs.height = img.naturalHeight || img.height || 100;
        const ctx = cvs.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(cvs.toDataURL('image/png'));
          return;
        }
      } catch (e) {
        console.warn('Image base64 conversion failed:', e);
      }
      resolve('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>');
    };

    img.onerror = () => {
      resolve('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>');
    };

    img.src = url;
  });
};

// Standalone pure JS converter for oklch(L C H [/ A]) -> rgb(r, g, b) / rgba(r, g, b, a)
const parseOklchToRgba = (colorStr: string): string | null => {
  const innerMatch = colorStr.match(/oklch\((.+)\)/i);
  if (!innerMatch) return null;

  const raw = innerMatch[1].trim();
  const parts = raw.split('/');
  const colorParts = parts[0].trim().split(/[\s,]+/);
  if (colorParts.length < 3) return null;

  const parseVal = (str: string, maxVal: number = 1): number => {
    if (!str || str === 'none') return 0;
    if (str.endsWith('%')) {
      const num = (parseFloat(str) / 100) * maxVal;
      return isNaN(num) ? 0 : num;
    }
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const L = parseVal(colorParts[0], 1);
  const C = parseVal(colorParts[1], 1);
  const H = parseVal(colorParts[2], 360);
  const alpha = parts[1] !== undefined ? parseVal(parts[1].trim(), 1) : 1;

  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let b_val = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  r = r > 0.0031308 ? 1.055 * Math.pow(Math.max(0, r), 1 / 2.4) - 0.055 : 12.92 * Math.max(0, r);
  g = g > 0.0031308 ? 1.055 * Math.pow(Math.max(0, g), 1 / 2.4) - 0.055 : 12.92 * Math.max(0, g);
  b_val = b_val > 0.0031308 ? 1.055 * Math.pow(Math.max(0, b_val), 1 / 2.4) - 0.055 : 12.92 * Math.max(0, b_val);

  const R = Math.min(255, Math.max(0, Math.round(r * 255)));
  const G = Math.min(255, Math.max(0, Math.round(g * 255)));
  const B = Math.min(255, Math.max(0, Math.round(b_val * 255)));

  if (alpha < 1) {
    return `rgba(${R}, ${G}, ${B}, ${alpha})`;
  }
  return `rgb(${R}, ${G}, ${B})`;
};

// Standalone pure JS converter for oklab(L a b [/ A]) -> rgb(r, g, b) / rgba(r, g, b, a)
const parseOklabToRgba = (colorStr: string): string | null => {
  const innerMatch = colorStr.match(/oklab\((.+)\)/i);
  if (!innerMatch) return null;

  const raw = innerMatch[1].trim();
  const parts = raw.split('/');
  const colorParts = parts[0].trim().split(/[\s,]+/);
  if (colorParts.length < 3) return null;

  const parseVal = (str: string): number => {
    if (!str || str === 'none') return 0;
    if (str.endsWith('%')) {
      const num = parseFloat(str) / 100;
      return isNaN(num) ? 0 : num;
    }
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const L = parseVal(colorParts[0]);
  const a = parseVal(colorParts[1]);
  const b = parseVal(colorParts[2]);
  const alpha = parts[1] !== undefined ? parseVal(parts[1].trim()) : 1;

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let b_val = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  r = r > 0.0031308 ? 1.055 * Math.pow(Math.max(0, r), 1 / 2.4) - 0.055 : 12.92 * Math.max(0, r);
  g = g > 0.0031308 ? 1.055 * Math.pow(Math.max(0, g), 1 / 2.4) - 0.055 : 12.92 * Math.max(0, g);
  b_val = b_val > 0.0031308 ? 1.055 * Math.pow(Math.max(0, b_val), 1 / 2.4) - 0.055 : 12.92 * Math.max(0, b_val);

  const R = Math.min(255, Math.max(0, Math.round(r * 255)));
  const G = Math.min(255, Math.max(0, Math.round(g * 255)));
  const B = Math.min(255, Math.max(0, Math.round(b_val * 255)));

  if (alpha < 1) {
    return `rgba(${R}, ${G}, ${B}, ${alpha})`;
  }
  return `rgb(${R}, ${G}, ${B})`;
};

const dummyCtx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
const unsupportedRegex = /(oklch|oklab|lab|lch|color)\((?:[^()]+|\([^()]*\))*\)/gi;

const convertSingleColor = (colorMatch: string): string => {
  if (!colorMatch || typeof colorMatch !== 'string') return colorMatch;

  // 1. Try Canvas 2D API conversion
  if (dummyCtx) {
    try {
      dummyCtx.fillStyle = 'rgb(1, 2, 3)';
      dummyCtx.fillStyle = colorMatch;
      const computed = dummyCtx.fillStyle;
      if (computed && computed !== 'rgb(1, 2, 3)' && !/(oklch|oklab|lab|lch|color)\(/i.test(computed)) {
        return computed;
      }
    } catch (e) {}
  }

  // 2. Pure JS math fallback for oklch
  if (/oklch\(/i.test(colorMatch)) {
    const parsed = parseOklchToRgba(colorMatch);
    if (parsed) return parsed;
  }

  // 3. Pure JS math fallback for oklab
  if (/oklab\(/i.test(colorMatch)) {
    const parsed = parseOklabToRgba(colorMatch);
    if (parsed) return parsed;
  }

  // 4. Default safe fallback
  if (colorMatch.includes('/ 0') || colorMatch.includes('/0')) {
    return 'transparent';
  }
  return 'rgba(0, 0, 0, 0)';
};

const cleanString = (str: string): string => {
  if (!str || typeof str !== 'string' || !/(oklch|oklab|lab|lch|color)\(/i.test(str)) {
    return str;
  }
  unsupportedRegex.lastIndex = 0;
  return str.replace(unsupportedRegex, (match) => convertSingleColor(match));
};

let isCSSPatched = false;
const patchCSSStyleDeclaration = () => {
  if (isCSSPatched || typeof CSSStyleDeclaration === 'undefined') return;
  isCSSPatched = true;

  try {
    const origGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;
    CSSStyleDeclaration.prototype.getPropertyValue = function(property: string): string {
      const value = origGetPropertyValue.call(this, property);
      if (value && typeof value === 'string' && /(oklch|oklab|lab|lch|color)\(/i.test(value)) {
        return cleanString(value);
      }
      return value;
    };
  } catch (e) {
    console.warn('CSSStyleDeclaration patch note:', e);
  }
};

/**
 * Converts modern unsupported CSS color declarations (oklab, oklch, lab, lch, color)
 * across all DOM nodes, computed styles, and stylesheets into standard RGB/Hex values so html2canvas never fails.
 */
const sanitizeModernColors = (clonedDoc: Document) => {
  patchCSSStyleDeclaration();

  try {
    // 1. Fast inline style attribute sanitization (no computed style loops to prevent lag)
    const allNodes = clonedDoc.querySelectorAll('*');
    allNodes.forEach((node) => {
      if (node instanceof HTMLElement || node instanceof SVGElement) {
        const inlineStyle = node.getAttribute('style');
        if (inlineStyle && /(oklch|oklab|lab|lch|color)\(/i.test(inlineStyle)) {
          node.setAttribute('style', cleanString(inlineStyle));
        }
      }
    });

    // 2. Sanitize internal <style> sheets textContent
    const styleTags = clonedDoc.querySelectorAll('style');
    styleTags.forEach((tag) => {
      if (tag.textContent && /(oklch|oklab|lab|lch|color)\(/i.test(tag.textContent)) {
        tag.textContent = cleanString(tag.textContent);
      }
    });

    // 3. Sanitize CSS Rules in document.styleSheets
    try {
      const sheets = Array.from(clonedDoc.styleSheets);
      sheets.forEach((sheet) => {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || []);
          rules.forEach((rule) => {
            if (rule.cssText && /(oklch|oklab|lab|lch|color)\(/i.test(rule.cssText)) {
              const cleanText = cleanString(rule.cssText);
              try {
                (rule as any).style.cssText = cleanText;
              } catch (e) {}
            }
          });
        } catch (e) {}
      });
    } catch (e) {}
  } catch (err) {
    console.warn('Modern color sanitization note:', err);
  }
};

export const generatePdfFromElement = async (
  elementId: string,
  filename: string = 'document.pdf',
  download: boolean = true
): Promise<Blob | null> => {
  // 1. Smart Element Lookup
  let element: HTMLElement | null = null;
  const initialEl = document.getElementById(elementId);

  if (initialEl) {
    element = initialEl;
  } else {
    // Find candidate elements in the DOM
    const candidates = [
      document.getElementById('email-pdf-render-target'),
      document.getElementById('invoice-printable-target'),
      document.getElementById('offer-pdf-element'),
      document.getElementById('offer-pdf-target'),
      document.querySelector('.invoice-document-root') as HTMLElement,
    ];

    for (const cand of candidates) {
      if (cand) {
        element = cand as HTMLElement;
        break;
      }
    }
  }

  if (!element) {
    console.error(`PDF element with id "${elementId}" not found in DOM`);
    return null;
  }

  try {
    // 2. Pre-convert all images inside element to inline Data URLs to prevent canvas taint
    const imgs = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      imgs.map(async (img) => {
        if (img.src && !img.src.startsWith('data:')) {
          const originalSrc = img.src;
          try {
            const b64 = await convertImageToBase64(originalSrc);
            if (b64) img.src = b64;
          } catch (e) {
            // Keep original if conversion fails
          }
        }
      })
    );

    // Pre-sanitize live document and patch global window.getComputedStyle before html2canvas clones it
    sanitizeModernColors(document);

    // 3. Render Canvas safely without allowTaint or OKLAB/OKLCH errors
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth || 1024,
      onclone: (clonedDoc) => {
        // Sanitize any Tailwind v4 OKLAB/OKLCH colors in cloned DOM
        sanitizeModernColors(clonedDoc);

        const targetId = element?.id || elementId;
        const clonedEl = clonedDoc.getElementById(targetId) || clonedDoc.querySelector('.invoice-document-root') || clonedDoc.body;
        if (clonedEl && clonedEl instanceof HTMLElement) {
          clonedEl.style.maxHeight = 'none';
          clonedEl.style.height = 'auto';
          clonedEl.style.overflow = 'visible';
          clonedEl.style.transform = 'none';
          clonedEl.style.position = 'static';
          clonedEl.style.visibility = 'visible';
          clonedEl.style.opacity = '1';

          // Reset parent container styles
          let parent = clonedEl.parentElement;
          while (parent && parent !== clonedDoc.body) {
            parent.style.position = 'static';
            parent.style.visibility = 'visible';
            parent.style.opacity = '1';
            parent.style.display = 'block';
            parent.style.left = '0px';
            parent.style.top = '0px';
            parent = parent.parentElement;
          }
        }
      },
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    // 4. Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / (canvas.width || 1);

    // Fit onto single A4 page if document is standard 1-page size (up to 325mm)
    if (imgHeight <= 325) {
      const renderHeight = Math.min(imgHeight, pageHeight);
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, renderHeight, undefined, 'FAST');
    } else {
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 15) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
    }

    const blob = pdf.output('blob');

    if (download) {
      // 5. Trigger Direct Download
      try {
        pdf.save(filename);
      } catch (saveErr) {
        console.warn('pdf.save failed, using URL download fallback:', saveErr);
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          URL.revokeObjectURL(blobUrl);
        }, 500);
      }
    }

    return blob;
  } catch (err: any) {
    console.error('PDF generation error:', err);
    return null;
  }
};

export const printElement = (elementId: string) => {
  const originalTitle = document.title;
  window.print();
  document.title = originalTitle;
};
