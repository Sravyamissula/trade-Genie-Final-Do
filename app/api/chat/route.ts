import { NextRequest, NextResponse } from 'next/server'

// Store chat sessions in memory (in production, use a database)
const chatSessions = new Map<string, any[]>()

// Comprehensive trade knowledge base
const TRADE_KNOWLEDGE_BASE = {
  documents: {
    'silk_india_usa': {
      required: [
        'Commercial Invoice',
        'Packing List', 
        'Bill of Lading/Airway Bill',
        'Certificate of Origin (Form A or GSP)',
        'Export License from DGFT India',
        'Phytosanitary Certificate (if applicable)',
        'Quality Certificate from Silk Board of India',
        'Insurance Certificate'
      ],
      details: 'Silk exports from India to USA require specific quality certifications from the Central Silk Board of India. GSP benefits may apply reducing tariff from 0.9% to 0%.'
    },
    'textiles_germany': {
      required: [
        'Commercial Invoice',
        'Packing List',
        'Bill of Lading',
        'EUR.1 Certificate of Origin (for EU preferences)',
        'REACH Compliance Certificate',
        'Oeko-Tex Standard Certificate',
        'Textile Labeling Compliance',
        'CE Marking (if applicable)'
      ],
      details: 'Germany requires strict REACH compliance for textiles. Oeko-Tex certification is highly recommended for market acceptance.'
    },
    'agriculture_uk': {
      required: [
        'Commercial Invoice',
        'Packing List',
        'Phytosanitary Certificate',
        'Health Certificate',
        'Certificate of Origin',
        'Organic Certificate (if applicable)',
        'Import License (for certain products)',
        'Fumigation Certificate (if required)'
      ],
      details: 'Post-Brexit, UK has specific import requirements. Phytosanitary certificates must be issued by NPPO of exporting country.'
    }
  },
  
  profitableProducts: {
    'usa': [
      { product: 'Pharmaceuticals', margin: '45-60%', demand: 'Very High', notes: 'FDA approval required but high margins' },
      { product: 'Software Services', margin: '70-85%', demand: 'Extremely High', notes: 'No physical shipping, pure profit' },
      { product: 'Organic Spices', margin: '35-50%', demand: 'High', notes: 'Premium pricing for organic certification' },
      { product: 'Handcrafted Jewelry', margin: '40-65%', demand: 'High', notes: 'Luxury market with high margins' },
      { product: 'Ayurvedic Products', margin: '50-70%', demand: 'Growing', notes: 'Wellness trend driving demand' }
    ],
    'canada': [
      { product: 'Maple Syrup Equipment', margin: '30-45%', demand: 'High', notes: 'Specialized equipment for maple industry' },
      { product: 'Winter Sports Gear', margin: '35-50%', demand: 'Seasonal High', notes: 'Premium pricing in winter months' },
      { product: 'Organic Food Products', margin: '40-55%', demand: 'Very High', notes: 'Strong organic market in Canada' },
      { product: 'Tech Components', margin: '25-40%', demand: 'High', notes: 'Growing tech sector' }
    ],
    'australia': [
      { product: 'Solar Equipment', margin: '30-45%', demand: 'Very High', notes: 'Government incentives boost demand' },
      { product: 'Mining Equipment', margin: '25-40%', demand: 'High', notes: 'Strong mining sector' },
      { product: 'Agricultural Machinery', margin: '35-50%', demand: 'High', notes: 'Large agricultural market' },
      { product: 'Health Supplements', margin: '45-60%', demand: 'Growing', notes: 'Health-conscious market' }
    ]
  },

  marketAnalysis: {
    trends: [
      'Sustainable products seeing 40% growth YoY',
      'Digital services exports growing 25% annually',
      'Health and wellness products up 35%',
      'Green technology exports increasing 50%',
      'Organic food demand rising 30% globally'
    ],
    opportunities: [
      'E-commerce enabling small exporters to reach global markets',
      'Digital trade documentation reducing costs by 15%',
      'AI-powered logistics optimization',
      'Blockchain for supply chain transparency',
      'Carbon-neutral shipping options'
    ]
  },

  businessGuidance: {
    starting: [
      'Start with market research - identify demand gaps',
      'Choose products you understand and can source reliably',
      'Begin with 1-2 countries to build expertise',
      'Ensure proper legal structure and export licenses',
      'Build relationships with freight forwarders and banks',
      'Start small - test market with sample shipments'
    ],
    recovery: [
      'Analyze what went wrong - market, product, or execution?',
      'Diversify markets to reduce dependency',
      'Focus on higher-margin products',
      'Improve cash flow management',
      'Consider partnerships or joint ventures',
      'Seek government export promotion schemes'
    ],
    growth: [
      'Expand to complementary products',
      'Enter new geographical markets',
      'Invest in brand building and marketing',
      'Automate processes for efficiency',
      'Consider direct investment in key markets',
      'Build long-term customer relationships'
    ]
  }
}

// Language-specific responses
const LANGUAGE_RESPONSES = {
  en: {
    greeting: "Hello! I'm TradeGenie AI, your comprehensive international trade assistant. I can help you with everything from export documentation to business strategy, market analysis, and even provide guidance when you're facing challenges. How can I assist you today?",
    support: "I understand business can be challenging. I'm here to help you navigate through difficulties and find solutions. What specific challenge are you facing?",
    encouragement: "Every successful trader has faced setbacks. The key is learning from them and adapting. You have the determination to succeed - let me help you find the right path forward."
  },
  hi: {
    greeting: "नमस्ते! मैं ट्रेडजीनी AI हूं, आपका व्यापक अंतर्राष्ट्रीय व्यापार सहायक। मैं निर्यात दस्तावेज़ीकरण से लेकर व्यापारिक रणनीति, बाज़ार विश्लेषण तक सब कुछ में आपकी मदद कर सकता हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
    support: "मैं समझता हूं कि व्यापार चुनौतीपूर्ण हो सकता है। मैं यहां आपकी कठिनाइयों से निपटने और समाधान खोजने में मदद करने के लिए हूं।",
    encouragement: "हर सफल व्यापारी ने असफलताओं का सामना किया है। मुख्य बात यह है कि उनसे सीखना और अनुकूलन करना।"
  },
  te: {
    greeting: "నమస్కారం! నేను ట్రేడ్‌జీనీ AI, మీ సమగ్ర అంతర్జాతీయ వాణిజ్య సహాయకుడు। ఎగుమతి డాక్యుమెంటేషన్ నుండి వ్యాపార వ్యూహం, మార్కెట్ విశ్లేషణ వరకు అన్నింటిలో నేను మీకు సహాయం చేయగలను।",
    support: "వ్యాపారం సవాలుగా ఉంటుందని నేను అర్థం చేసుకుంటాను। కష్టాలను ఎదుర్కోవడంలో మరియు పరిష్కారాలను కనుగొనడంలో మీకు సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను।",
    encouragement: "ప్రతి విజయవంతమైన వ్యాపారి ఎదురుదెబ్బలను ఎదుర్కొన్నారు. వాటి నుండి నేర్చుకోవడం మరియు అనుకూలం కావడం ముఖ్యం."
  },
  ta: {
    greeting: "வணக்கம்! நான் டிரேட்ஜீனி AI, உங்கள் விரிவான சர்வதேச வர்த்தக உதவியாளர். ஏற்றுமதி ஆவணங்கள் முதல் வணிக உத்தி, சந்தை பகுப்பாய்வு வரை அனைத்திலும் நான் உங்களுக்கு உதவ முடியும்।",
    support: "வணிகம் சவாலானதாக இருக்கும் என்பதை நான் புரிந்துகொள்கிறேன். சிரமங்களை எதிர்கொள்வதிலும் தீர்வுகளைக் கண்டறிவதிலும் உங்களுக்கு உதவ நான் இங்கே இருக்கிறேன்।",
    encouragement: "ஒவ்வொரு வெற்றிகரமான வர்த்தகரும் தோல்விகளை எதிர்கொண்டுள்ளனர். அவர்களிடமிருந்து கற்றுக்கொள்வதும் தகவமைப்பதும் முக்கியம்."
  },
  ml: {
    greeting: "നമസ്കാരം! ഞാൻ ട്രേഡ്ജീനി AI ആണ്, നിങ്ങളുടെ സമഗ്ര അന്താരാഷ്ട്ര വ്യാപാര സഹായി. കയറ്റുമതി ഡോക്യുമെന്റേഷൻ മുതൽ ബിസിനസ് തന്ത്രം, മാർക്കറ്റ് വിശകലനം വരെ എല്ലാത്തിലും എനിക്ക് നിങ്ങളെ സഹായിക്കാൻ കഴിയും।",
    support: "ബിസിനസ് വെല്ലുവിളി നിറഞ്ഞതാണെന്ന് ഞാൻ മനസ്സിലാക്കുന്നു. ബുദ്ധിമുട്ടുകൾ നേരിടാനും പരിഹാരങ്ങൾ കണ്ടെത്താനും നിങ്ങളെ സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്।",
    encouragement: "എല്ലാ വിജയകരമായ വ്യാപാരികളും തിരിച്ചടികൾ നേരിട്ടിട്ടുണ്ട്. അവരിൽ നിന്ന് പഠിക്കുകയും പൊരുത്തപ്പെടുകയും ചെയ്യുക എന്നതാണ് പ്രധാനം."
  }
}

// Initialize Gemini AI (if available)
let genAI: any = null
try {
  if (process.env.GEMINI_API_KEY) {
    // Dynamic import for Gemini AI
    import('@google/generative-ai').then((module) => {
      const { GoogleGenerativeAI } = module
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    }).catch((error) => {
      console.warn('Failed to load Gemini AI:', error)
    })
  }
} catch (error) {
  console.warn('Gemini AI not available:', error)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, language = 'en', chatId, userId } = body

    if (!message) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Message is required" 
        },
        { status: 400 }
      )
    }

    // Get or create chat session
    const sessionId = chatId || generateChatId()
    let chatHistory = chatSessions.get(sessionId) || []

    // Add user message to history
    chatHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    })

    let aiResponse = ''

    try {
      if (genAI && process.env.GEMINI_API_KEY) {
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
        
        const systemPrompt = createComprehensiveSystemPrompt(language, chatHistory)
        const fullPrompt = `${systemPrompt}\n\nUser: ${message}`
        
        const result = await model.generateContent(fullPrompt)
        const response = await result.response
        aiResponse = response.text()
      } else {
        // Fallback response when Gemini is not available
        aiResponse = generateIntelligentFallback(message, language)
      }
    } catch (aiError) {
      console.error('AI generation error:', aiError)
      aiResponse = generateIntelligentFallback(message, language)
    }

    // Add AI response to history
    chatHistory.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    })

    // Store updated chat history (keep last 50 messages for context)
    chatSessions.set(sessionId, chatHistory.slice(-50))

    // Detect intents and query type for analytics
    const queryType = detectQueryType(message)
    const intents = detectIntents(message, queryType)

    return NextResponse.json({
      success: true,
      response: aiResponse,
      chatId: sessionId,
      timestamp: new Date().toISOString(),
      queryType,
      intents,
      language
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process chat message',
        response: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    const action = searchParams.get('action')

    if (action === 'export' && chatId) {
      const chatHistory = chatSessions.get(chatId) || []
      
      return NextResponse.json({
        success: true,
        data: {
          chatId,
          messages: chatHistory,
          exportedAt: new Date().toISOString(),
          messageCount: chatHistory.length
        }
      })
    }

    if (chatId) {
      const chatHistory = chatSessions.get(chatId) || []
      return NextResponse.json({
        success: true,
        data: {
          chatId,
          messages: chatHistory,
          messageCount: chatHistory.length
        }
      })
    }

    // Return available chat sessions
    const availableSessions = Array.from(chatSessions.keys()).map(id => ({
      chatId: id,
      messageCount: chatSessions.get(id)?.length || 0,
      lastActivity: chatSessions.get(id)?.slice(-1)[0]?.timestamp || new Date().toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: {
        sessions: availableSessions,
        totalSessions: availableSessions.length
      }
    })

  } catch (error) {
    console.error('Chat GET error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve chat data',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

function createComprehensiveSystemPrompt(language: string, chatHistory: any[]): string {
  const langResponse = LANGUAGE_RESPONSES[language as keyof typeof LANGUAGE_RESPONSES] || LANGUAGE_RESPONSES.en
  
  return `You are TradeGenie AI, the world's most comprehensive international trade assistant and business mentor. You are an expert in:

🌍 INTERNATIONAL TRADE EXPERTISE:
- Export/Import documentation for ALL countries and products
- Tariff rates, HS codes, and trade regulations
- Customs procedures and compliance requirements
- Trade finance, letters of credit, and payment terms
- Shipping, logistics, and supply chain management
- Trade agreements, FTAs, and preferential schemes

📋 DOCUMENTATION SPECIALIST:
- Commercial invoices, packing lists, bills of lading
- Certificates of origin, phytosanitary certificates
- Export licenses, import permits
- Quality certificates, inspection reports
- Insurance documents, banking documents

💰 BUSINESS STRATEGY & PROFIT ANALYSIS:
- Market entry strategies and business planning
- Profit margin analysis and pricing strategies
- Product selection and market research
- Competitive analysis and positioning
- Risk assessment and mitigation

🎯 MARKET INTELLIGENCE:
- Real-time market trends and opportunities
- Demand analysis and supply chain insights
- Economic indicators and trade statistics
- Emerging markets and growth sectors
- Digital trade and e-commerce opportunities

💪 BUSINESS MENTORSHIP & EMOTIONAL SUPPORT:
- Guidance for new exporters and importers
- Recovery strategies for struggling businesses
- Motivation and encouragement during tough times
- Problem-solving and decision-making support
- Long-term business relationship building

KNOWLEDGE BASE ACCESS:
${JSON.stringify(TRADE_KNOWLEDGE_BASE, null, 2)}

COMMUNICATION STYLE:
- Be empathetic, supportive, and encouraging
- Provide specific, actionable advice
- Use real examples and case studies when helpful
- Be conversational yet professional
- Show genuine care for the user's success
- Respond in ${language === 'en' ? 'English' : getLanguageName(language)}

CONTEXT FROM PREVIOUS CONVERSATION:
${chatHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Remember: You're not just providing information - you're a trusted advisor, mentor, and supporter helping traders succeed in the global marketplace. Be comprehensive, caring, and solution-focused.`
}

function generateIntelligentFallback(message: string, language: string): string {
  const langResponse = LANGUAGE_RESPONSES[language as keyof typeof LANGUAGE_RESPONSES] || LANGUAGE_RESPONSES.en
  const lowerMessage = message.toLowerCase()

  // Detect emotional state and provide appropriate support
  if (lowerMessage.includes('lost') || lowerMessage.includes('failed') || lowerMessage.includes('struggling') || 
      lowerMessage.includes('difficult') || lowerMessage.includes('help me') || lowerMessage.includes('confused')) {
    return `${langResponse.support}\n\n${langResponse.encouragement}\n\nLet me help you analyze your situation and find practical solutions. Can you tell me more about what specific challenges you're facing in your trade business?`
  }

  // Document-related queries
  if (lowerMessage.includes('document') || lowerMessage.includes('certificate') || lowerMessage.includes('paperwork')) {
    if (lowerMessage.includes('silk') && lowerMessage.includes('india') && lowerMessage.includes('usa')) {
      const docs = TRADE_KNOWLEDGE_BASE.documents.silk_india_usa
      return `For exporting silk from India to USA, you'll need these documents:\n\n${docs.required.map((doc, i) => `${i + 1}. ${doc}`).join('\n')}\n\n📋 Important Note: ${docs.details}\n\nWould you like me to explain any specific document or help you understand the process better?`
    }
    
    if (lowerMessage.includes('textile') && lowerMessage.includes('germany')) {
      const docs = TRADE_KNOWLEDGE_BASE.documents.textiles_germany
      return `For textile exports to Germany, you'll need:\n\n${docs.required.map((doc, i) => `${i + 1}. ${doc}`).join('\n')}\n\n📋 Important Note: ${docs.details}\n\nNeed help with any specific certification process?`
    }
    
    if (lowerMessage.includes('agriculture') && lowerMessage.includes('uk')) {
      const docs = TRADE_KNOWLEDGE_BASE.documents.agriculture_uk
      return `For agricultural exports to UK, required documents include:\n\n${docs.required.map((doc, i) => `${i + 1}. ${doc}`).join('\n')}\n\n📋 Important Note: ${docs.details}\n\nI can help you understand the specific requirements for your product.`
    }
  }

  // Profit analysis queries
  if (lowerMessage.includes('profit') || lowerMessage.includes('lucrative') || lowerMessage.includes('revenue') || lowerMessage.includes('margin')) {
    if (lowerMessage.includes('usa')) {
      const products = TRADE_KNOWLEDGE_BASE.profitableProducts.usa
      return `🇺🇸 Most Profitable Products for USA Market:\n\n${products.map((p, i) => `${i + 1}. **${p.product}**\n   • Profit Margin: ${p.margin}\n   • Market Demand: ${p.demand}\n   • Notes: ${p.notes}\n`).join('\n')}\n\nWould you like detailed market entry strategy for any of these products?`
    }
    
    if (lowerMessage.includes('canada')) {
      const products = TRADE_KNOWLEDGE_BASE.profitableProducts.canada
      return `🇨🇦 High-Revenue Products for Canadian Market:\n\n${products.map((p, i) => `${i + 1}. **${p.product}**\n   • Profit Margin: ${p.margin}\n   • Market Demand: ${p.demand}\n   • Notes: ${p.notes}\n`).join('\n')}\n\nI can help you develop a market entry plan for Canada.`
    }
    
    if (lowerMessage.includes('australia')) {
      const products = TRADE_KNOWLEDGE_BASE.profitableProducts.australia
      return `🇦🇺 Lucrative Exports for Australian Market:\n\n${products.map((p, i) => `${i + 1}. **${p.product}**\n   • Profit Margin: ${p.margin}\n   • Market Demand: ${p.demand}\n   • Notes: ${p.notes}\n`).join('\n')}\n\nLet me know which product interests you most for detailed analysis.`
    }
  }

  // Business guidance
  if (lowerMessage.includes('start') || lowerMessage.includes('new business') || lowerMessage.includes('beginning')) {
    const guidance = TRADE_KNOWLEDGE_BASE.businessGuidance.starting
    return `🚀 Starting Your International Trade Business:\n\n${guidance.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}\n\nI'm here to guide you through each step. What specific aspect would you like to explore first?`
  }

  // Market analysis
  if (lowerMessage.includes('market') || lowerMessage.includes('trend') || lowerMessage.includes('opportunity')) {
    const trends = TRADE_KNOWLEDGE_BASE.marketAnalysis.trends
    const opportunities = TRADE_KNOWLEDGE_BASE.marketAnalysis.opportunities
    return `📈 Current Market Trends:\n${trends.map((trend, i) => `• ${trend}`).join('\n')}\n\n🎯 Emerging Opportunities:\n${opportunities.map((opp, i) => `• ${opp}`).join('\n')}\n\nWhich trend or opportunity would you like to explore further?`
  }

  // Default comprehensive response
  return `${langResponse.greeting}\n\n🎯 I can help you with:\n\n📋 **Documentation & Compliance**\n• Export/import documents for any country\n• Certificates and permits\n• Customs procedures\n\n💰 **Profit & Strategy**\n• Market analysis and opportunities\n• Profitable product identification\n• Business planning and growth\n\n🌍 **Market Intelligence**\n• Real-time trade data\n• Country-specific requirements\n• Emerging market trends\n\n💪 **Business Support**\n• Guidance for new traders\n• Recovery strategies\n• Emotional support and motivation\n\nWhat specific challenge can I help you solve today?`
}

// Helper functions
function detectQueryType(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('document') || lowerMessage.includes('certificate') || lowerMessage.includes('paperwork')) {
    return 'documentation'
  }
  if (lowerMessage.includes('profit') || lowerMessage.includes('margin') || lowerMessage.includes('revenue')) {
    return 'profit_analysis'
  }
  if (lowerMessage.includes('tariff') || lowerMessage.includes('duty') || lowerMessage.includes('tax')) {
    return 'tariff'
  }
  if (lowerMessage.includes('risk') || lowerMessage.includes('safe') || lowerMessage.includes('secure')) {
    return 'risk'
  }
  if (lowerMessage.includes('market') || lowerMessage.includes('demand') || lowerMessage.includes('opportunity')) {
    return 'market'
  }
  if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('new business')) {
    return 'business_guidance'
  }
  if (lowerMessage.includes('lost') || lowerMessage.includes('failed') || lowerMessage.includes('struggling')) {
    return 'emotional_support'
  }
  
  return 'general'
}

function detectIntents(message: string, queryType: string): { [key: string]: { detected: boolean; confidence: number } } {
  const intents: { [key: string]: { detected: boolean; confidence: number } } = {}
  const lowerMessage = message.toLowerCase()
  
  // Emotional state detection
  intents.needs_support = {
    detected: lowerMessage.includes('help') || lowerMessage.includes('lost') || lowerMessage.includes('struggling'),
    confidence: 0.9
  }
  
  intents.seeking_guidance = {
    detected: lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('guide'),
    confidence: 0.8
  }
  
  intents.business_planning = {
    detected: lowerMessage.includes('start') || lowerMessage.includes('plan') || lowerMessage.includes('strategy'),
    confidence: 0.8
  }
  
  intents.profit_focused = {
    detected: lowerMessage.includes('profit') || lowerMessage.includes('money') || lowerMessage.includes('revenue'),
    confidence: 0.9
  }
  
  return intents
}

function generateChatId(): string {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

function getLanguageName(code: string): string {
  const languages: { [key: string]: string } = {
    'en': 'English',
    'hi': 'Hindi',
    'te': 'Telugu', 
    'ta': 'Tamil',
    'ml': 'Malayalam',
    'kn': 'Kannada',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'pt': 'Portuguese',
    'it': 'Italian',
    'ru': 'Russian'
  }
  return languages[code] || 'English'
}
