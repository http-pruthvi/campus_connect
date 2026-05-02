/**
 * Simple NLP Mock for Auto-Tagging
 * Analyzes text and returns suggested categories based on keywords.
 */

const CATEGORY_MAP = {
  "Placement & Careers": ["job", "interview", "resume", "placement", "career", "salary", "company", "internship"],
  "Academics": ["exam", "syllabus", "assignment", "grades", "marks", "professor", "lecture", "notes", "study"],
  "Extracurricular": ["sports", "dance", "music", "club", "competition", "festival", "event"],
  "Technical Support": ["login", "password", "wifi", "network", "portal", "error", "bug"],
  "Campus Life": ["hostel", "canteen", "food", "library", "gym", "transport", "bus"]
};

export const suggestCategory = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  
  // Count keyword matches for each category
  const scores = {};
  
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    scores[category] = 0;
    keywords.forEach(keyword => {
      // Basic regex to match whole words
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = text.match(regex);
      if (matches) {
        scores[category] += matches.length;
      }
    });
  }
  
  // Find category with highest score
  let bestCategory = "";
  let maxScore = 0;
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }
  
  // Return the best category if it has at least 1 match, otherwise return empty
  return maxScore > 0 ? bestCategory : "";
};
