# DigiText 📝

> AI-powered notes converter — turn handwritten images, PDFs, and lecture audio into clean, structured Markdown + $\KaTeX$ output, ready to import into Obsidian or Joplin.

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini%20API-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev)
[![🥇 MorganHack 2025](https://img.shields.io/badge/MorganHack%202025-1st%20Place-gold?style=flat)](#)

---

## 📌 What Is This?

Taking notes during a fast-paced lecture — especially one heavy with equations — is hard. Rewriting them digitally afterward takes even longer. **DigiText** eliminates that second step.

Upload a photo of your handwritten notes, a PDF, or a recorded audio clip, and DigiText uses **Google Gemini** to intelligently extract and structure the content into formatted **Markdown + $\KaTeX$**, which you can paste directly into Obsidian or Joplin and have it render perfectly.

> 🥇 **1st Place Winner — MorganHack 2025** (50+ competing teams)

---

## ✨ Features

| Feature | Description |
|--------|-------------|
|  Image & Document Upload | Accepts `.jpg`, `.png`, `.pdf`, `.docx` — extracts text and structure via Gemini |
|  Audio Upload | Upload lecture recordings; Gemini transcribes and formats the content |
|  Manual Text Entry | Type or paste raw notes; DigiText structures and formats them |
| $\KaTeX$ Rendering | Mathematical expressions are rendered with $\KaTeX$ — e.g. $\int_0^\infty e^{-x^2}dx = \frac{\sqrt{\pi}}{2}$ |
|  Live Preview | Real-time preview updates as you type or upload |
|  Export Ready | Output is clean Markdown that imports directly into Obsidian or Joplin |

---

## 🛠️ Technologies Used

**Frontend**
- React (component UI, live preview)
- $\KaTeX$ (math rendering)
- Markdown parser (structured text preview)

**Backend**
- Python / Flask (REST API)
- Google Gemini API (multimodal AI: image, audio, text understanding)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A Google Gemini API key ([get one here](https://ai.google.dev))

### Installation

```bash
# Clone the repository
git clone https://github.com/Haley-glitch/digitext.git
cd digitext

# Install frontend dependencies
npm install

# Install backend dependencies
pip install -r requirements.txt
```

### Configuration

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

### Running the App

```bash
# Start the Flask backend (in one terminal)
python app.py

# Start the React frontend (in another terminal)
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗺️ How It Works

```
User Input (image / audio / text)
         │
         ▼
┌─────────────────────┐
│  Flask REST API     │  ← Receives uploaded file or text
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Google Gemini API  │  ← Multimodal understanding:
│                     │    extracts content, infers structure,
│                     │    identifies math expressions
└────────┬────────────┘
         │  structured Markdown + KaTeX string
         ▼
┌─────────────────────┐
│  React Frontend     │  ← Renders live preview,
│                     │    displays formatted output
└────────┬────────────┘
         │
         ▼
  Export to Obsidian / Joplin
```

---

## 💡 Example Output

**Input:** A photo of handwritten calculus notes

**DigiText Output:**
```markdown
## Integration by Parts

Given the formula:

$$\int u \, dv = uv - \int v \, du$$

**Example:** Evaluate $\int x e^x \, dx$

Let $u = x$, $dv = e^x dx$, so $du = dx$, $v = e^x$

$$\int x e^x \, dx = x e^x - \int e^x \, dx = e^x(x - 1) + C$$
```

---

## ⚠️ Current Limitations

- Markdown support is partial — standard headings, bold, italics, and $\KaTeX$ work well; complex features like nested lists and tables are still in progress
- OCR accuracy on low-quality or heavily stylized handwriting may vary
- Mobile layout improvements are planned

---

## 🔭 Roadmap

- [ ] Full Markdown spec compliance
- [ ] Improved OCR post-processing for cleaner formatting
- [ ] Mobile-friendly UI overhaul
- [ ] Subject-aware formatting (branch into different academic disciplines)
- [ ] "Check your understanding" quiz generation from notes

---

## 🧠 Reflection

The biggest challenge at the hackathon was getting Gemini to reliably output *well-structured* Markdown with properly escaped $\KaTeX$ — the model would occasionally produce malformed LaTeX or mix rendering styles. We solved this through careful prompt engineering, specifying output format constraints explicitly in the system prompt. It was a great lesson in how much the quality of an AI-powered app depends on the quality of its prompts, not just its code.

---

## 🔗 Links

- 🏆 [Devpost Submission](https://devpost.com/software/digitext)

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
