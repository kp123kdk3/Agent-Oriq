import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIConversationContext {
  hotelName?: string;
  guestName?: string;
  bookingInfo?: any;
  guestHistory?: any;
  language?: string;
}

export interface AIResponse {
  message: string;
  intent?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  urgency?: number; // 0-10
  actions?: string[]; // Suggested actions
  confidence?: number;
}

export class OpenAIService {
  private model: string;

  constructor(model: string = 'gpt-4-turbo-preview') {
    this.model = process.env.OPENAI_MODEL || model;
  }

  /**
   * Generate AI response for guest conversations
   */
  async generateResponse(
    userMessage: string,
    context: AIConversationContext = {}
  ): Promise<AIResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(context);

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content || '';

      // Parse response for structured data
      return this.parseResponse(response, userMessage);
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  /**
   * Analyze call transcript for intent, sentiment, and urgency
   */
  async analyzeCall(transcript: string, context: AIConversationContext = {}): Promise<{
    intent: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    urgency: number;
    summary: string;
    actions: string[];
  }> {
    try {
      const prompt = `Analyze this hotel call transcript and extract:
1. Intent (booking, modification, cancellation, information, complaint, request)
2. Sentiment (positive, neutral, negative)
3. Urgency (0-10 scale)
4. Brief summary
5. Required actions

Transcript: ${transcript}
Hotel: ${context.hotelName || 'Unknown'}`;

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing hotel guest conversations. Return structured JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const analysis = JSON.parse(completion.choices[0]?.message?.content || '{}');

      return {
        intent: analysis.intent || 'information',
        sentiment: analysis.sentiment || 'neutral',
        urgency: analysis.urgency || 0,
        summary: analysis.summary || '',
        actions: analysis.actions || [],
      };
    } catch (error: any) {
      console.error('Call analysis error:', error);
      return {
        intent: 'information',
        sentiment: 'neutral',
        urgency: 0,
        summary: '',
        actions: [],
      };
    }
  }

  /**
   * Generate upselling suggestions
   */
  async generateUpsellSuggestions(
    guestInfo: any,
    bookingInfo: any,
    hotelInfo: any
  ): Promise<Array<{
    type: string;
    description: string;
    revenue: number;
    confidence: number;
  }>> {
    try {
      const prompt = `Based on this guest booking, suggest upselling opportunities:
Guest: ${JSON.stringify(guestInfo)}
Booking: ${JSON.stringify(bookingInfo)}
Hotel: ${JSON.stringify(hotelInfo)}

Return JSON array of suggestions with type, description, estimated revenue, and confidence (0-1).`;

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a revenue optimization expert for hotels.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
      return result.suggestions || [];
    } catch (error: any) {
      console.error('Upsell generation error:', error);
      return [];
    }
  }

  private buildSystemPrompt(context: AIConversationContext): string {
    return `You are an AI receptionist for ${context.hotelName || 'a hotel'}. 
You are professional, friendly, and helpful. You can:
- Answer questions about the hotel
- Handle booking requests
- Modify or cancel reservations
- Provide information about amenities, services, and local area
- Handle guest requests and complaints
- Route complex issues to human staff when needed

${context.guestName ? `Guest name: ${context.guestName}` : ''}
${context.bookingInfo ? `Current booking: ${JSON.stringify(context.bookingInfo)}` : ''}
${context.language ? `Respond in: ${context.language}` : 'Respond in English'}

Be concise, helpful, and always offer to assist further.`;
  }

  private parseResponse(response: string, userMessage: string): AIResponse {
    // Simple parsing - in production, use more sophisticated NLP
    const urgency = this.detectUrgency(userMessage);
    const sentiment = this.detectSentiment(userMessage);

    return {
      message: response,
      intent: this.detectIntent(userMessage),
      sentiment,
      urgency,
      confidence: 0.8,
    };
  }

  private detectIntent(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('book') || lower.includes('reservation')) return 'booking';
    if (lower.includes('cancel')) return 'cancellation';
    if (lower.includes('change') || lower.includes('modify')) return 'modification';
    if (lower.includes('complaint') || lower.includes('problem')) return 'complaint';
    if (lower.includes('request') || lower.includes('need')) return 'request';
    return 'information';
  }

  private detectSentiment(message: string): 'positive' | 'neutral' | 'negative' {
    const lower = message.toLowerCase();
    const negativeWords = ['bad', 'terrible', 'awful', 'disappointed', 'angry', 'frustrated'];
    const positiveWords = ['great', 'excellent', 'wonderful', 'thank', 'appreciate', 'love'];

    if (negativeWords.some(word => lower.includes(word))) return 'negative';
    if (positiveWords.some(word => lower.includes(word))) return 'positive';
    return 'neutral';
  }

  private detectUrgency(message: string): number {
    const lower = message.toLowerCase();
    if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('immediately')) return 9;
    if (lower.includes('asap') || lower.includes('soon')) return 7;
    if (lower.includes('when') || lower.includes('time')) return 5;
    return 3;
  }
}

export const openAIService = new OpenAIService();

