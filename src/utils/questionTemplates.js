// src/utils/questionTemplates.js

// 1) Define your question templates:
const templates = [
    expr => `Explain in your own words what the equation \\(${expr}\\) means.`,
    expr => `Solve for the main variable in \\(${expr}\\).`,
    expr => `Differentiate \\(${expr}\\) with respect to its primary variable.`,
    expr => `Identify and describe each term in \\(${expr}\\).`,
    expr => `Under what conditions (values, domains) is \\(${expr}\\) valid?`
  ];
  
  // 2) Extract all LaTeX snippets from a text blob
  export function extractMathSnippets(text) {
    const blockRe = /\$\$([\s\S]+?)\$\$/g;
    const inlineRe = /\$([^$]+?)\$/g;
    let snippets = [];
    let m;
    while ((m = blockRe.exec(text)))   snippets.push(m[1].trim());
    while ((m = inlineRe.exec(text)))  snippets.push(m[1].trim());
    return snippets;
  }
  
  // 3) Map the first up-to-5 snippets through your templates
  export function generateQuestionsFromMath(snippets) {
    const questions = [];
    for (let i = 0; i < Math.min(snippets.length, 5); i++) {
      const tpl = templates[i % templates.length];
      questions.push(tpl(snippets[i]));
    }
    while (questions.length < 5) {
      const expr = snippets[questions.length % snippets.length] || '';
      questions.push(
        expr
          ? `Summarize the role of \\(${expr}\\) in the overall context.`
          : `Pick one of the expressions above and explain its significance.`
      );
    }
    return questions;
  }
  