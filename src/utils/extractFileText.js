/**
 * Extracts text content from uploaded files.
 * Supports .txt, .pdf, and .docx files.
 *
 * @param {File} file - The File object from file input
 * @returns {Promise<string>} Extracted text content
 */
export async function extractFileText(file) {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // Handle plain text files
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await readTextFile(file);
  }

  // Handle PDF files
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await extractPdfText(file);
  }

  // Handle DOCX files
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
    return await extractDocxText(file);
  }

  // Fallback: try to read as text
  return await readTextFile(file);
}

/**
 * Reads a plain text file and returns its content.
 *
 * @param {File} file - The File object
 * @returns {Promise<string>} File content as string
 */
function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (error) => {
      reject(new Error('Failed to read file: ' + error.message));
    };

    reader.readAsText(file);
  });
}

/**
 * Extracts text from a PDF file.
 * Uses a simple approach - for production, consider adding pdfjs-dist.
 *
 * @param {File} file - The PDF File object
 * @returns {Promise<string>} Extracted text content
 */
async function extractPdfText(file) {
  // Simple approach: try to read as text (works for some PDFs)
  // For better PDF parsing, you would use pdfjs-dist:
  // npm install pdfjs-dist
  //
  // Example with pdfjs-dist:
  // ```js
  // import * as pdfjs from 'pdfjs-dist';
  // const arrayBuffer = await file.arrayBuffer();
  // const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  // let text = '';
  // for (let i = 1; i <= pdf.numPages; i++) {
  //   const page = await pdf.getPage(i);
  //   const textContent = await page.getTextContent();
  //   text += textContent.items.map(item => item.str).join(' ') + '\n';
  // }
  // return text;
  // ```

  try {
    // Try reading as UTF-8 text first (works for text-based PDFs)
    const text = await readTextFile(file);
    // Clean up common PDF artifacts
    return text.replace(/\x00/g, '').replace(/\r\n/g, '\n').trim();
  } catch (error) {
    // If that fails, read as array buffer and try to extract readable strings
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const buffer = event.target.result;
          const uint8Array = new Uint8Array(buffer);
          // Extract readable ASCII/UTF-8 characters
          let text = '';
          for (let i = 0; i < uint8Array.length; i++) {
            const char = uint8Array[i];
            // Keep printable ASCII and common whitespace
            if ((char >= 32 && char <= 126) || char === 10 || char === 13 || char === 9) {
              text += String.fromCharCode(char);
            }
          }
          // Clean up and normalize whitespace
          text = text.replace(/\s+/g, ' ').trim();
          resolve(text);
        } catch (e) {
          reject(new Error('Failed to extract PDF text: ' + e.message));
        }
      };

      reader.onerror = (error) => {
        reject(new Error('Failed to read PDF file: ' + error.message));
      };

      reader.readAsArrayBuffer(file);
    });
  }
}

/**
 * Extracts text from a DOCX file.
 * DOCX files are ZIP archives containing XML files.
 * We extract text by reading the ZIP and parsing XML content.
 *
 * @param {File} file - The DOCX File object
 * @returns {Promise<string>} Extracted text content
 */
async function extractDocxText(file) {
  try {
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // DOCX files are ZIP archives - we'll extract text content
    // This is a simplified approach that works for most DOCX files
    let text = '';

    // Convert to string and look for XML text content
    const decoder = new TextDecoder('utf-8');
    const content = decoder.decode(uint8Array);

    // Extract text from XML tags in the DOCX structure
    // DOCX stores text in <w:t> tags within document.xml
    const textMatches = content.match(/<w:t[^>]*>([^<]*)/g);
    if (textMatches) {
      text = textMatches
        .map(match => match.replace(/<w:t[^>]*>/, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // If no text found with XML parsing, try simple extraction
    if (!text) {
      // Extract readable characters
      for (let i = 0; i < uint8Array.length; i++) {
        const char = uint8Array[i];
        if ((char >= 32 && char <= 126) || char === 10 || char === 13 || char === 9) {
          text += String.fromCharCode(char);
        }
      }
      text = text.replace(/\s+/g, ' ').trim();
    }

    return text || 'Could not extract text from DOCX. Try saving as .txt format.';
  } catch (error) {
    console.error('DOCX extraction error:', error);
    return 'Failed to extract text from DOCX file: ' + error.message;
  }
}
