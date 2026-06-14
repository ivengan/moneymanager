/**
 * Parses raw text (SMS or receipt notes) into structured transaction data using offline rule-based logic.
 * @param {string} rawText - The raw input text.
 * @returns {Promise<Object>} - Parsed transaction data containing amount, merchant, and category.
 */
export async function parseTransactionText(rawText) {
  // Offline Rule-based Bot Logic
  console.log("Using rule-based bot to parse:", rawText);
  
  let amount = 0;
  let merchant = "Unknown";
  let category = "Uncategorized";

  // 1. Extract amount (look for RM or $ followed by numbers)
  const amountMatch = rawText.match(/(?:RM|\$)?\s*(\d+(?:\.\d{2})?)/i);
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1]);
  }

  // 2. Simple keyword mapping for categories and merchants
  const lowerText = rawText.toLowerCase();
  
  const rules = [
    { keywords: ['tealive', 'starbucks', 'coffee', 'mcdonalds', 'kfc', 'food'], category: 'Food & Beverage' },
    { keywords: ['grab', 'uber', 'taxi', 'petrol', 'shell', 'petronas'], category: 'Transport' },
    { keywords: ['transfer', 'sent to', 'received from'], category: 'Transfer' },
    { keywords: ['shopee', 'lazada', 'mall', 'grocery', 'aeon'], category: 'Shopping' },
    { keywords: ['tnb', 'water', 'electric', 'bill', 'maxis', 'celcom', 'unifi'], category: 'Utilities' }
  ];

  // Attempt to categorize based on keywords
  for (const rule of rules) {
    const matchedKeyword = rule.keywords.find(kw => lowerText.includes(kw));
    if (matchedKeyword) {
      category = rule.category;
      
      if (category === 'Transfer') {
        const transferMatch = rawText.match(/to\s+([a-zA-Z]+)/i);
        merchant = transferMatch ? transferMatch[1] : "Transfer Recipient";
      } else {
        // Capitalize first letter of matched keyword for merchant name
        merchant = matchedKeyword.charAt(0).toUpperCase() + matchedKeyword.slice(1);
      }
      break;
    }
  }

  // 3. Fallback for merchant if rules didn't catch one
  if (merchant === "Unknown") {
      const words = rawText.split(/[\s/]+/);
      // find a word that is not a number and not RM/SMS
      const possibleMerchant = words.find(w => !w.match(/\d/) && !['rm', 'sms:', 'sms'].includes(w.toLowerCase()));
      if (possibleMerchant) {
          merchant = possibleMerchant;
      }
  }

  return {
    amount,
    merchant,
    category
  };
}
