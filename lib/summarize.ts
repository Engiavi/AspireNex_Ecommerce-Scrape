// utils/summarizeDescription.ts

export const summarizeDescription = (description: string): string => {
    const keyPatterns = [
      /price/i,
      /material/i,
      /feature/i,
      /benefit/i,
      /includes/i,
      /design/i,
      /battery/i,
      /warranty/i,
      /camera/i,
      /screen/i,
      /performance/i,
    ];
  
    const sentences = description.split('\n').map(sentence => sentence.trim()).filter(Boolean);
  
    const summary = sentences.filter(sentence => {
      return keyPatterns.some(pattern => pattern.test(sentence));
    });
  
    return summary.join(' ');
  };
  