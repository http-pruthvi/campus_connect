const detectPriority = (text: string): "High" | "Medium" | "Low" => {
  const content = text.toLowerCase();

  if (
    content.includes("urgent") ||
    content.includes("last date") ||
    content.includes("deadline") ||
    content.includes("tomorrow") ||
    content.includes("important")
  ) {
    return "High";
  }

  if (
    content.includes("exam") ||
    content.includes("submission") ||
    content.includes("interview")
  ) {
    return "Medium";
  }

  return "Low";
};

export default detectPriority;