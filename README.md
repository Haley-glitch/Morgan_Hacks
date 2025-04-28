# DigiText

**DigiText** is a lightweight text-processing project that allows users to upload images (.jpg, .img., .png, etc) or documents (.pdf, .docx), upload audio or manually enter text, which is then converted into formatted output using **Markdown** + **KaTeX** rendering that can then be imported to tools such as Joplin or Obsidian.

---

## Features
- 🖼️ Upload an image, document, audio or ✍️ type text manually.
- ✏️ Support for **KaTeX** for rendering mathematical formulas.
- 🌟 Real-time preview as you type or upload!

---

## Current Limitations
- **Markdown support is not integrated**:  
  DigiText can take in the syntax of markdown when typed manually so that when u paste it to Joblin or Obsidian it will render, but **it does not support complete Markdown language specification YET**.
- Complex Markdown features (like tables, nested lists, or extended syntax) may not work correctly.
- Full Markdown compliance is planned **after this semester**.

---

## Future Plans To Look Forward To
- ✅ Full Markdown integration and spec compliance.
- ✅ Render text with **Markdown** styling (headings, bold, italics, etc.).
- ✅ Better OCR post-processing for cleaner formatting.
- ✅ Improved error handling for mixed Markdown/KaTeX inputs.
- ✅ Mobile-friendly improvements.
- ✅ Check your understanding to not just focus on Math.
- ✅ Branch to various majors.

---

## How to Run
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
