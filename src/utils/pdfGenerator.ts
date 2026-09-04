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

const hexToRgb = (hex: string): { r: number; g: number; b: number; a: number } | null => {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) {
    h = h.split('').map(c => c + c).join('');
  }
  if (h.length === 6) {
    const num = parseInt(h, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255, a: 1 };
  }
  if (h.length === 8) {
    const num = parseInt(h, 16);
    return { r: (num >> 24) & 255, g: (num >> 16) & 255, b: (num >> 8) & 255, a: Number(((num & 255) / 255).toFixed(3)) };
  }
  return null;
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

const applyAlphaToRgb = (rgbStr: string, alpha: number): string => {
  const obj = parseToRgbObj(rgbStr);
  if (obj) {
    const finalAlpha = Number((obj.a * alpha).toFixed(3));
    return `rgba(${obj.r}, ${obj.g}, ${obj.b}, ${finalAlpha})`;
  }
  return rgbStr;
};

const parseToRgbObj = (str: string): { r: number; g: number; b: number; a: number } | null => {
  if (!str || typeof str !== 'string') return null;
  const s = str.trim();
  if (s.startsWith('#')) return hexToRgb(s);

  if (s === 'transparent') return { r: 255, g: 255, b: 255, a: 0 };
  if (s === 'white') return { r: 255, g: 255, b: 255, a: 1 };
  if (s === 'black') return { r: 0, g: 0, b: 0, a: 1 };

  const match = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1,
    };
  }
  return null;
};

// Standalone pure JS converter for Tailwind v4 color-mix(in space, color1 pct1, color2 pct2)
const parseColorMixToRgba = (colorStr: string): string | null => {
  const innerMatch = colorStr.match(/color-mix\(\s*in\s+[\w-]+\s*,\s*(.+)\s*\)/i);
  if (!innerMatch) return null;

  const content = innerMatch[1].trim();
  const commaIdx = content.lastIndexOf(',');
  if (commaIdx === -1) return null;

  const part1 = content.slice(0, commaIdx).trim();
  const part2 = content.slice(commaIdx + 1).trim();

  const parseColorPart = (part: string): { color: string; pct: number } => {
    const pctMatch = part.match(/\s+([\d.]+)%\s*$/);
    let pct = 100;
    let cStr = part;
    if (pctMatch) {
      pct = parseFloat(pctMatch[1]);
      cStr = part.slice(0, part.lastIndexOf(pctMatch[0])).trim();
    }
    return { color: cStr, pct: pct / 100 };
  };

  const c1 = parseColorPart(part1);
  const c2 = parseColorPart(part2);

  // If part2 is transparent (standard Tailwind opacity pattern e.g. bg-slate-50/60)
  if (c2.color === 'transparent' || c2.color.includes('/0') || c2.color.includes('/ 0')) {
    const convertedC1 = convertSingleColor(c1.color);
    return applyAlphaToRgb(convertedC1, c1.pct);
  }

  if (c1.color === 'transparent' || c1.color.includes('/0') || c1.color.includes('/ 0')) {
    const convertedC2 = convertSingleColor(c2.color);
    return applyAlphaToRgb(convertedC2, c2.pct);
  }

  const rgb1 = parseToRgbObj(convertSingleColor(c1.color));
  const rgb2 = parseToRgbObj(convertSingleColor(c2.color));

  if (!rgb1 || !rgb2) return convertSingleColor(c1.color);

  const weight1 = c1.pct;
  const weight2 = c2.pct;
  const totalWeight = weight1 + weight2 || 1;

  const r = Math.round((rgb1.r * weight1 + rgb2.r * weight2) / totalWeight);
  const g = Math.round((rgb1.g * weight1 + rgb2.g * weight2) / totalWeight);
  const b = Math.round((rgb1.b * weight1 + rgb2.b * weight2) / totalWeight);
  const a = (rgb1.a * weight1 + rgb2.a * weight2) / totalWeight;

  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
};

const dummyCtx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
const unsupportedRegex = /(oklch|oklab|color-mix|lab|lch|color)\((?:[^()]+|\([^()]*\))*\)/gi;

const convertSingleColor = (colorMatch: string): string => {
  if (!colorMatch || typeof colorMatch !== 'string') return colorMatch;
  const str = colorMatch.trim();

  // 1. MUST test color-mix FIRST before oklch / oklab to preserve transparency
  if (/color-mix\(/i.test(str)) {
    const parsed = parseColorMixToRgba(str);
    if (parsed) return parsed;
  }

  // 2. Pure JS math fallback for oklch
  if (/oklch\(/i.test(str)) {
    const parsed = parseOklchToRgba(str);
    if (parsed) return parsed;
  }

  // 3. Pure JS math fallback for oklab
  if (/oklab\(/i.test(str)) {
    const parsed = parseOklabToRgba(str);
    if (parsed) return parsed;
  }

  // 4. Check if already standard Hex or RGB/RGBA
  const obj = parseToRgbObj(str);
  if (obj) {
    return obj.a < 1 ? `rgba(${obj.r}, ${obj.g}, ${obj.b}, ${obj.a})` : `rgb(${obj.r}, ${obj.g}, ${obj.b})`;
  }

  // 5. Try Canvas 2D API for other standard CSS color strings
  if (dummyCtx) {
    try {
      dummyCtx.fillStyle = 'rgb(1, 2, 3)';
      dummyCtx.fillStyle = str;
      const computed = dummyCtx.fillStyle;
      if (
        computed &&
        computed !== 'rgb(1, 2, 3)' &&
        computed !== '#000000' &&
        computed !== 'rgb(0, 0, 0)' &&
        !/(oklch|oklab|color-mix|lab|lch|color)\(/i.test(computed)
      ) {
        return computed;
      }
    } catch (e) {}
  }

  // 6. Default safe transparent fallback (NEVER return solid black rgb(0,0,0))
  if (str.includes('/ 0') || str.includes('/0') || str.includes('transparent')) {
    return 'transparent';
  }
  return 'rgba(255, 255, 255, 0)';
};

const cleanString = (str: string): string => {
  if (!str || typeof str !== 'string' || !/(oklch|oklab|color-mix|lab|lch|color)\(/i.test(str)) {
    return str;
  }
  unsupportedRegex.lastIndex = 0;
  return str.replace(unsupportedRegex, (match) => convertSingleColor(match));
};

// Intercept getComputedStyle at window level using Proxy so html2canvas property reads never return oklab/oklch
const patchWindowGetComputedStyle = (targetWindow: Window) => {
  if (!targetWindow || (targetWindow as any).__oklch_proxy_patched__) return;
  try {
    (targetWindow as any).__oklch_proxy_patched__ = true;
    const origFn = targetWindow.getComputedStyle.bind(targetWindow);

    targetWindow.getComputedStyle = (elt: Element, pseudoElt?: string | null): CSSStyleDeclaration => {
      const style = origFn(elt, pseudoElt);
      return new Proxy(style, {
        get(target, prop, receiver) {
          if (prop === 'getPropertyValue') {
            return (propName: string) => {
              const val = target.getPropertyValue(propName);
              return cleanString(val);
            };
          }
          const val = Reflect.get(target, prop, receiver);
          if (typeof val === 'string' && /(oklch|oklab|color-mix|lab|lch|color)\(/i.test(val)) {
            return cleanString(val);
          }
          if (typeof val === 'function') {
            return val.bind(target);
          }
          return val;
        }
      });
    };
  } catch (e) {
    console.warn('getComputedStyle Proxy patch note:', e);
  }
};

let isCSSPatched = false;
const patchCSSStyleDeclaration = () => {
  if (isCSSPatched || typeof CSSStyleDeclaration === 'undefined') return;
  isCSSPatched = true;

  try {
    const origGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;
    CSSStyleDeclaration.prototype.getPropertyValue = function(property: string): string {
      const value = origGetPropertyValue.call(this, property);
      if (value && typeof value === 'string' && /(oklch|oklab|color-mix|lab|lch|color)\(/i.test(value)) {
        return cleanString(value);
      }
      return value;
    };
  } catch (e) {
    console.warn('CSSStyleDeclaration patch note:', e);
  }
};

/**
 * Converts modern unsupported CSS color declarations (oklab, oklch, color-mix, lab, lch, color)
 * across all DOM nodes, computed styles, and stylesheets into standard RGB/Hex values so html2canvas never fails.
 */
const sanitizeModernColors = (clonedDoc: Document) => {
  patchCSSStyleDeclaration();
  if (clonedDoc.defaultView) {
    patchWindowGetComputedStyle(clonedDoc.defaultView);
  }

  try {
    // 1. Fast inline style attribute sanitization
    const allNodes = clonedDoc.querySelectorAll('*');
    allNodes.forEach((node) => {
      if (node instanceof HTMLElement || node instanceof SVGElement) {
        const inlineStyle = node.getAttribute('style');
        if (inlineStyle && /(oklch|oklab|color-mix|lab|lch|color)\(/i.test(inlineStyle)) {
          node.setAttribute('style', cleanString(inlineStyle));
        }
      }
    });

    // 2. Sanitize internal <style> sheets textContent
    const styleTags = clonedDoc.querySelectorAll('style');
    styleTags.forEach((tag) => {
      if (tag.textContent && /(oklch|oklab|color-mix|lab|lch|color)\(/i.test(tag.textContent)) {
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
            if (rule instanceof CSSStyleRule && rule.style && rule.style.cssText) {
              if (/(oklch|oklab|color-mix|lab|lch|color)\(/i.test(rule.style.cssText)) {
                rule.style.cssText = cleanString(rule.style.cssText);
              }
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
    // 2. Wait for document fonts to finish loading
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font loading wait note:', e);
      }
    }

    // 3. Pre-convert all images inside element to inline Data URLs & ensure complete load
    const imgs = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      imgs.map(async (img) => {
        if (!img.complete) {
          await new Promise((res) => {
            img.onload = res;
            img.onerror = res;
            setTimeout(res, 500);
          });
        }
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

    // 4. Render Canvas safely on cloned DOM without mutating live document
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
        // Sanitize modern colors ONLY in cloned DOM iframe
        sanitizeModernColors(clonedDoc);

        const targetId = element?.id || elementId;
        const clonedTarget = clonedDoc.getElementById(targetId) || clonedDoc.querySelector('.printable-invoice-container') || clonedDoc.querySelector('.invoice-document-root');
        
        if (clonedTarget && clonedTarget instanceof HTMLElement) {
          // Isolate target element directly inside clonedDoc.body to strip modal wrappers, dark backdrops, and scrollbars
          clonedDoc.body.innerHTML = '';
          clonedDoc.body.appendChild(clonedTarget);

          clonedDoc.body.style.backgroundColor = '#ffffff';
          clonedDoc.body.style.margin = '0px';
          clonedDoc.body.style.padding = '0px';
          clonedDoc.body.style.overflow = 'visible';

          clonedTarget.style.maxHeight = 'none';
          clonedTarget.style.height = 'auto';
          clonedTarget.style.maxWidth = '100%';
          clonedTarget.style.width = '794px'; // Exactly 210mm at 96 DPI
          clonedTarget.style.minHeight = '1123px'; // Exactly 297mm at 96 DPI
          clonedTarget.style.boxSizing = 'border-box';
          clonedTarget.style.overflow = 'visible';
          clonedTarget.style.transform = 'none';
          clonedTarget.style.position = 'relative';
          clonedTarget.style.margin = '0 auto';
          clonedTarget.style.visibility = 'visible';
          clonedTarget.style.opacity = '1';
          if (!clonedTarget.style.backgroundColor || clonedTarget.style.backgroundColor === 'transparent') {
            clonedTarget.style.backgroundColor = '#ffffff';
          }
          clonedTarget.style.border = 'none';
          clonedTarget.style.borderRadius = '0px';
          clonedTarget.style.boxShadow = 'none';

          // Explicitly sanitize computed styles on all cloned nodes to inline RGB/RGBA
          try {
            const defaultView = clonedDoc.defaultView || window;
            const allElements = [clonedTarget, ...Array.from(clonedTarget.querySelectorAll('*'))];
            allElements.forEach((el) => {
              if (el instanceof HTMLElement || el instanceof SVGElement) {
                const compStyle = defaultView.getComputedStyle(el);
                const bg = compStyle.backgroundColor;
                if (bg && /(oklch|oklab|color-mix|lab|lch|color)\(/i.test(bg)) {
                  (el as HTMLElement).style.backgroundColor = cleanString(bg);
                }
                const c = compStyle.color;
                if (c && /(oklch|oklab|color-mix|lab|lch|color)\(/i.test(c)) {
                  (el as HTMLElement).style.color = cleanString(c);
                }
                const bc = compStyle.borderColor;
                if (bc && /(oklch|oklab|color-mix|lab|lch|color)\(/i.test(bc)) {
                  (el as HTMLElement).style.borderColor = cleanString(bc);
                }
                const bs = compStyle.boxShadow;
                if (bs && /(oklch|oklab|color-mix|lab|lch|color)\(/i.test(bs)) {
                  (el as HTMLElement).style.boxShadow = cleanString(bs);
                }
              }
            });
          } catch (e) {
            console.warn('Element inline style resolution note:', e);
          }
        }
      },
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    // 5. Create A4 PDF (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / (canvas.width || 1);

    // Single-page fitting check:
    // If document is standard 1-page size, fit it 100% full-bleed edge-to-edge on 210mm x 297mm A4
    if (imgHeight <= 315) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pageHeight, undefined, 'FAST');
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
      // 6. Trigger Direct Download
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
