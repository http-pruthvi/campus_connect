const classifyNotice = (text) => {
  const content = text.toLowerCase();

  if (
    content.includes("exam") ||
    content.includes("assignment") ||
    content.includes("lecture") ||
    content.includes("result")
  ) {
    return "Academic";
  }

  if (
    content.includes("event") ||
    content.includes("fest") ||
    content.includes("workshop") ||
    content.includes("seminar")
  ) {
    return "Event";
  }

  if (
    content.includes("internship") ||
    content.includes("placement") ||
    content.includes("job") ||
    content.includes("company")
  ) {
    return "Placement";
  }

  if (
    content.includes("urgent") ||
    content.includes("last date") ||
    content.includes("deadline") ||
    content.includes("important")
  ) {
    return "Urgent";
  }

  return "General";
};

export default classifyNotice;