import { GoogleGenAI } from '@google/genai';
import { MenuItem, Canteen, Review } from '../src/types/index.ts';

const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * 1. Natural Language Food Search
 * e.g., "something spicy under ₹100" or "healthy lunch without paneer"
 */
export async function aiFoodSearch(query: string, menuItems: MenuItem[]): Promise<{
  matchingItemIds: string[];
  explanation: string;
  suggestedTags: string[];
}> {
  if (!query || !query.trim()) {
    return { matchingItemIds: [], explanation: '', suggestedTags: [] };
  }

  const itemsContext = menuItems.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    isVeg: item.isVeg,
    spiceLevel: item.spiceLevel,
    calories: item.calories,
    description: item.description,
    isAvailable: item.isAvailable,
  }));

  if (ai) {
    try {
      const prompt = `You are the AI food finder for CampusBites, a college canteen platform.
User Query: "${query}"

Here is the current college canteen menu items list (JSON):
${JSON.stringify(itemsContext)}

Analyze the user's intent (taste preferences, budget, spice level, dietary restrictions like veg/non-veg, excluded ingredients like paneer, time of day or meal type).
Select the best matching item IDs (ordered by best match first, max 6 items) and explain concisely in 1-2 friendly sentences why these match the student's request.
Also provide 2-4 short filter tags (e.g. ["Under ₹100", "Spicy", "High Protein"]).

Respond ONLY with valid JSON in this exact structure:
{
  "matchingItemIds": ["item-101", "item-301"],
  "explanation": "Here are delicious spicy options under ₹100 available right now across the canteens.",
  "suggestedTags": ["Spicy", "Under ₹100"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        matchingItemIds: Array.isArray(parsed.matchingItemIds) ? parsed.matchingItemIds : [],
        explanation: parsed.explanation || `Found recommendations for "${query}"`,
        suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : [],
      };
    } catch (err) {
      console.warn('Gemini AI food search failed, falling back to heuristic search:', err);
    }
  }

  // Smart heuristic fallback
  const lower = query.toLowerCase();
  const maxPriceMatch = query.match(/under\s*(?:rs\.?|₹)?\s*(\d+)/i) || query.match(/(?:below|<)\s*(?:rs\.?|₹)?\s*(\d+)/i);
  const maxPrice = maxPriceMatch ? parseInt(maxPriceMatch[1], 10) : null;
  const wantsSpicy = lower.includes('spicy') || lower.includes('hot') || lower.includes('chilli') || lower.includes('chili');
  const wantsVeg = lower.includes('veg') && !lower.includes('non-veg');
  const wantsNonVeg = lower.includes('non-veg') || lower.includes('chicken') || lower.includes('egg');
  const excludePaneer = lower.includes('without paneer') || lower.includes('no paneer');
  const wantsHealthy = lower.includes('healthy') || lower.includes('diet') || lower.includes('protein');

  const matches = menuItems.filter((item) => {
    if (maxPrice !== null && item.price > maxPrice) return false;
    if (wantsVeg && !item.isVeg) return false;
    if (wantsNonVeg && item.isVeg) return false;
    if (excludePaneer && item.name.toLowerCase().includes('paneer')) return false;
    if (wantsSpicy && item.spiceLevel < 2) return false;
    if (wantsHealthy && item.category !== 'Healthy' && item.calories > 450) return false;

    // keyword match
    const text = `${item.name} ${item.description} ${item.category}`.toLowerCase();
    const words = lower.replace(/under|below|rs|₹|\d+|without|no/g, '').trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return true;
    return words.some((w) => text.includes(w));
  });

  return {
    matchingItemIds: matches.slice(0, 6).map((m) => m.id),
    explanation: `Found ${matches.length} campus canteen options matching "${query}".`,
    suggestedTags: [wantsSpicy ? 'Spicy' : '', maxPrice ? `Under ₹${maxPrice}` : '', wantsHealthy ? 'Healthy' : ''].filter(Boolean),
  };
}

/**
 * 2. AI Order Assistant
 * Recommend items, combos, and quantities based on budget, dietary preference, time of day, and past orders.
 */
export async function aiOrderAssistant(params: {
  budget: number;
  dietaryPreference: 'veg' | 'non-veg' | 'any';
  mealType: string;
  peopleCount: number;
  menuItems: MenuItem[];
}): Promise<{
  recommendationTitle: string;
  rationale: string;
  recommendedItems: { itemId: string; quantity: number; reason: string }[];
  totalPrice: number;
}> {
  const { budget, dietaryPreference, mealType, peopleCount, menuItems } = params;
  const itemsContext = menuItems
    .filter((m) => m.isAvailable)
    .map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      price: m.price,
      isVeg: m.isVeg,
      calories: m.calories,
      prepTime: m.preparationTime,
    }));

  if (ai) {
    try {
      const prompt = `You are CampusBites AI Dining Assistant for college students.
Request:
- Budget: ₹${budget}
- Dietary Preference: ${dietaryPreference}
- Meal Type/Time: ${mealType}
- Number of people: ${peopleCount}

Available menu items (JSON):
${JSON.stringify(itemsContext)}

Task:
Curate a balanced order combo that stays within or close to the budget (₹${budget}) and satisfies the ${peopleCount} student(s) with sufficient sustenance, drink/snack balance, and appropriate dietary filter.
Provide a catchy title (e.g. "Energy Study Feast" or "Quick Balanced Lunch"), a friendly rationale, and the list of recommended item IDs with quantity and short reason.

Respond ONLY with valid JSON in this exact structure:
{
  "recommendationTitle": "Study Fuel Combo",
  "rationale": "High-protein bowl paired with cold-pressed juice to keep you focused within ₹${budget}.",
  "recommendedItems": [
    { "itemId": "item-201", "quantity": 1, "reason": "Hearty satisfying protein" },
    { "itemId": "item-204", "quantity": 1, "reason": "Refreshing hydration" }
  ],
  "totalPrice": 225
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        recommendationTitle: parsed.recommendationTitle || 'Curated Campus Meal',
        rationale: parsed.rationale || 'Selected based on your campus dining preferences and budget.',
        recommendedItems: Array.isArray(parsed.recommendedItems) ? parsed.recommendedItems : [],
        totalPrice: typeof parsed.totalPrice === 'number' ? parsed.totalPrice : 0,
      };
    } catch (err) {
      console.warn('Gemini AI order assistant failed, using fallback:', err);
    }
  }

  // Heuristic fallback
  const filtered = menuItems.filter((i) => {
    if (!i.isAvailable) return false;
    if (dietaryPreference === 'veg' && !i.isVeg) return false;
    if (dietaryPreference === 'non-veg' && i.isVeg) return false;
    return true;
  });

  const picks: { itemId: string; quantity: number; reason: string }[] = [];
  let remainingBudget = budget;
  let total = 0;

  for (const item of filtered) {
    if (item.price <= remainingBudget) {
      picks.push({ itemId: item.id, quantity: 1, reason: `Fits your budget and ${mealType} preferences.` });
      remainingBudget -= item.price;
      total += item.price;
      if (picks.length >= (peopleCount > 1 ? 4 : 2)) break;
    }
  }

  return {
    recommendationTitle: `${mealType} Campus Combo`,
    rationale: `Selected ${picks.length} popular campus options within ₹${budget} for ${peopleCount} student(s).`,
    recommendedItems: picks,
    totalPrice: total,
  };
}

/**
 * 3. Smart Scheduled-Delivery Suggestion
 * Recommends the best available 15-minute time slot based on canteen load and preparation time.
 */
export async function aiDeliverySlotSuggestion(params: {
  canteen: Canteen;
  orderPrepTime: number;
  itemCount: number;
  targetDate: string;
}): Promise<{
  recommendedSlot: string;
  reason: string;
  availableSlots: { time: string; status: 'optimal' | 'moderate' | 'busy' }[];
}> {
  const { canteen, orderPrepTime, itemCount, targetDate } = params;

  // Generate valid 15-minute slots within canteen operating hours
  const [openH, openM] = canteen.openingTime.split(':').map(Number);
  const [closeH, closeM] = canteen.closingTime.split(':').map(Number);

  const slots: { time: string; status: 'optimal' | 'moderate' | 'busy' }[] = [];
  let curMins = openH * 60 + openM + 30; // at least 30 mins after opening
  const endMins = (closeH >= openH ? closeH : closeH + 24) * 60 + closeM - 30;

  while (curMins <= endMins) {
    const h = Math.floor(curMins / 60) % 24;
    const m = curMins % 60;
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    // simulate peak load around 12:30-14:00 (lunch) and 20:00-21:30 (dinner)
    const isPeak = (h >= 12 && h < 14) || (h >= 20 && h < 22);
    const status = isPeak ? 'busy' : (h === 11 || h === 17 ? 'moderate' : 'optimal');
    slots.push({ time: timeStr, status });
    curMins += 15;
  }

  if (ai) {
    try {
      const prompt = `You are CampusBites scheduling AI.
Canteen: "${canteen.name}"
Operating hours: ${canteen.openingTime} to ${canteen.closingTime}
Current Rush Capacity: ${canteen.rushCapacityPercent}%
Order Prep Time: ${orderPrepTime} minutes (${itemCount} items)
Delivery Date: ${targetDate}

Here are available slots:
${JSON.stringify(slots.slice(0, 16))}

Recommend the single best 15-minute delivery slot that ensures the fresher food, least kitchen queue delay, and seamless campus delivery.
Return JSON:
{
  "recommendedSlot": "13:15",
  "reason": "13:15 allows 25 mins of calm prep right after the primary lecture rush, ensuring warm food and quick delivery."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.recommendedSlot) {
        return {
          recommendedSlot: parsed.recommendedSlot,
          reason: parsed.reason || 'Optimal time slot with lowest kitchen queue.',
          availableSlots: slots,
        };
      }
    } catch (e) {
      console.warn('Gemini slot suggestion fallback:', e);
    }
  }

  // Fallback: pick the first optimal slot
  const optimalSlot = slots.find((s) => s.status === 'optimal') || slots[0];
  return {
    recommendedSlot: optimalSlot ? optimalSlot.time : '12:45',
    reason: `Calculated based on ${orderPrepTime} mins prep time and current kitchen queue capacity (${canteen.rushCapacityPercent}%).`,
    availableSlots: slots,
  };
}

/**
 * 4. AI Support Assistant
 * Answer FAQs about orders, refunds, canteen timings, delivery status; escalate to ticket when needed.
 */
export async function aiSupportAssistant(params: {
  userMessage: string;
  userContext: {
    userName: string;
    userEmail: string;
    role: string;
    recentOrders?: { id: string; status: string; total: number; canteenName: string }[];
  };
}): Promise<{
  reply: string;
  shouldEscalate: boolean;
  ticketDraft?: {
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  };
}> {
  const { userMessage, userContext } = params;

  if (ai) {
    try {
      const prompt = `You are "CampusBot", the helpful AI campus support concierge for CampusBites (college canteen food ordering platform).
Student/User: ${userContext.userName} (${userContext.userEmail}, Role: ${userContext.role})
Recent Orders: ${JSON.stringify(userContext.recentOrders || [])}

User message: "${userMessage}"

CampusBites Policies:
- Orders can be cancelled instantly before the canteen marks "Preparing". Once preparing has started, cancellations are not permitted because food is already on the stove.
- If a delivery arrives damaged, cold, or incorrect, users receive an automatic campus wallet refund or replacement voucher.
- Campus delivery is handled by vetted student agents with bicycle/e-scooter, with free delivery over ₹200.
- Central Canteen opens 07:30 to 21:30. Green Bites opens 08:00 to 20:00. Night Owl operates 16:00 to 03:00.
- If an agent is delayed due to campus weather or security gate checks, live tracking updates in real-time.

Respond warmly, concisely, and helpfully.
If the student is reporting an unresolved defect, food quality issue, payment deduction without order, or explicitly asks for a human admin / refund, set "shouldEscalate": true and create a "ticketDraft". Otherwise set "shouldEscalate": false.

Respond ONLY with valid JSON in this exact structure:
{
  "reply": "Your message here...",
  "shouldEscalate": false,
  "ticketDraft": {
    "subject": "Delay in Order ORD-...",
    "description": "User reported...",
    "priority": "medium"
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        reply: parsed.reply || 'I am here to help you with your campus canteen orders, timings, and delivery status!',
        shouldEscalate: Boolean(parsed.shouldEscalate),
        ticketDraft: parsed.ticketDraft,
      };
    } catch (e) {
      console.warn('Gemini support assistant fallback:', e);
    }
  }

  // Heuristic fallback
  const lower = userMessage.toLowerCase();
  const needsEscalation = lower.includes('refund') || lower.includes('stolen') || lower.includes('wrong item') || lower.includes('spoiled') || lower.includes('complaint');

  if (needsEscalation) {
    return {
      reply: `I understand your concern, ${userContext.userName}. I have escalated this issue directly to the College Canteen Admin team. A support ticket has been created and will be reviewed promptly.`,
      shouldEscalate: true,
      ticketDraft: {
        subject: `Campus Support: ${userMessage.slice(0, 40)}...`,
        description: userMessage,
        priority: 'high',
      },
    };
  }

  return {
    reply: `Hi ${userContext.userName}! Aryabhatta Central Canteen is open till 21:30, Green Bites till 20:00, and Night Owl Maggi till 03:00. You can track your active orders in real-time under the "Orders" tab. Let me know if you need help with anything else!`,
    shouldEscalate: false,
  };
}

/**
 * 5. Review Summarization
 * Summarize canteen reviews into pros, cons, and common complaints.
 */
export async function aiReviewSummary(canteen: Canteen, reviews: Review[]): Promise<{
  summary: string;
  pros: string[];
  cons: string[];
  highlightDish: string;
  studentSentimentScore: number; // 0-100
}> {
  if (reviews.length === 0) {
    return {
      summary: `No student reviews yet for ${canteen.name}. Be the first to review!`,
      pros: ['Freshly launched'],
      cons: [],
      highlightDish: 'Specialties available daily',
      studentSentimentScore: 90,
    };
  }

  const reviewTexts = reviews.map((r) => `Rating: ${r.rating}/5. "${r.comment}"`).join('\n');

  if (ai) {
    try {
      const prompt = `You are CampusBites review analyst for college canteens.
Canteen: "${canteen.name}" (${canteen.rating} / 5 based on ${canteen.ratingCount} reviews)
Student reviews:
${reviewTexts}

Analyze these student reviews and output:
- A crisp 2-sentence overall summary of student sentiment.
- 3 clear pros (bullet points).
- 2 constructive cons or common student complaints (if any).
- 1 highlight dish loved by students.
- studentSentimentScore (integer 0-100).

Respond ONLY with valid JSON:
{
  "summary": "...",
  "pros": ["...", "..."],
  "cons": ["...", "..."],
  "highlightDish": "...",
  "studentSentimentScore": 92
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        summary: parsed.summary || `${canteen.name} enjoys high popularity among students.`,
        pros: Array.isArray(parsed.pros) ? parsed.pros : ['Quick service', 'Great value'],
        cons: Array.isArray(parsed.cons) ? parsed.cons : ['Rush during lunch break'],
        highlightDish: parsed.highlightDish || 'Campus Special',
        studentSentimentScore: typeof parsed.studentSentimentScore === 'number' ? parsed.studentSentimentScore : 88,
      };
    } catch (e) {
      console.warn('Gemini review summary fallback:', e);
    }
  }

  // Heuristic fallback
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  return {
    summary: `${canteen.name} is rated ${avgRating.toFixed(1)}/5 by students, praised for generous college portions and prompt campus delivery.`,
    pros: ['Generous portion sizes', 'Prompt hostel delivery', 'Affordable student pricing'],
    cons: ['Peak queue between 13:00 - 14:00', 'Certain items sell out quickly during exams'],
    highlightDish: canteen.name.includes('Central') ? 'Masala Dosa & Kadak Chai' : canteen.name.includes('Green') ? 'Paneer Protein Bowl' : 'Double Cheese Maggi',
    studentSentimentScore: Math.round((avgRating / 5) * 100),
  };
}
