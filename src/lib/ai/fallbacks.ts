import { Language, UserRole } from '@/context/StadiumContext';
import { Zone, POI, Incident } from '@/types';

interface FallbackAnswer {
  reply: string;
  suggestedFollowups: string[];
  detectedIntent: string;
}

/**
 * Returns a deterministic, keyword-matched grounded answer when AI is unavailable.
 */
export function getDeterministicFallback(
  message: string,
  language: Language,
  role: UserRole,
  stadiumState: { zones: Zone[]; pois: POI[]; incidents: Incident[] }
): FallbackAnswer {
  const query = message.toLowerCase();
  
  // 1. Language: Hinglish
  // 1. Language: Hindi (Devanagari script)
  if (language === 'hi') {
    if (query.includes('restroom') || query.includes('toilet') || query.includes('washroom') || query.includes('saaf') || query.includes('shauchalay') || query.includes('shauchalaya')) {
      return {
        reply: "कॉन्कोर्स पर दो मुख्य शौचालय ब्लॉक हैं: एक उत्तर कॉन्कोर्स लिंक के पास और दूसरा दक्षिण कॉन्कोर्स लिंक के पास। दोनों पूरी तरह से व्हीलचेयर अनुकूल और सुलभ हैं।",
        suggestedFollowups: ["शौचालय कहाँ हैं?", "क्या व्हीलचेयर सुविधा है?"],
        detectedIntent: "amenity_lookup"
      };
    }
    if (query.includes('medical') || query.includes('injury') || query.includes('first aid') || query.includes('chot') || query.includes('doctor') || query.includes('chikitsa') || query.includes('aspataal')) {
      const activeMedicalInc = stadiumState.incidents.find(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED');
      let reply = "ईस्ट लोअर स्टैंड (सेक्शन 101) के पास प्राथमिक चिकित्सा स्टेशन (First Aid Station East) खुला और कार्यरत है।";
      if (activeMedicalInc) {
        reply += " ध्यान दें: सेक्शन 101 के पास अभी एक मेडिकल इमरजेंसी सक्रिय है, लेकिन मेडिकल टीम वहां तैनात है।";
      }
      return {
        reply,
        suggestedFollowups: ["निकटतम चिकित्सा केंद्र?", "आपातकालीन निकास कहाँ है?"],
        detectedIntent: "medical_lookup"
      };
    }
    if (query.includes('gate') || query.includes('entry') || query.includes('turnstile') || query.includes('bheed') || query.includes('crowd') || query.includes('dwar') || query.includes('pravesh')) {
      const gateB = stadiumState.zones.find(z => z.id === 'ZONE_GATE_B');
      const gateBOccupancy = gateB ? Math.round((gateB.currentOccupancy / gateB.capacity) * 100) : 0;
      
      let reply = "गेट ए (Gate A) वर्तमान में खुला है और वहां भीड़ बहुत कम है। आप आसानी से प्रवेश कर सकते हैं।";
      if (gateBOccupancy >= 90) {
        reply += ` चेतावनी: गेट बी (Gate B) पर भारी भीड़ (${gateBOccupancy}% क्षमता) है और लंबी कतार है। हम गेट ए का उपयोग करने का सुझाव देते हैं।`;
      }
      return {
        reply,
        suggestedFollowups: ["गेट ए कहाँ है?", "गेट बी की स्थिति?"],
        detectedIntent: "crowd_lookup"
      };
    }
    if (query.includes('shuttle') || query.includes('transit') || query.includes('bus') || query.includes('metro') || query.includes('station') || query.includes('yayat')) {
      return {
        reply: "मेट्रो और शटल बस प्लाजा (पारगमन हब) स्टेडियम के ठीक बाहर स्थित है। गेट ए या गेट बी दोनों निकास द्वारों से वहां पैदल मार्ग उपलब्ध हैं।",
        suggestedFollowups: ["बस प्लाजा कहाँ है?", "मेट्रो का समय?"],
        detectedIntent: "transit_lookup"
      };
    }
    // Default Hindi fallback
    return {
      reply: role === 'volunteer' 
        ? "नमस्ते! मैं आपका ग्राउंड वालंटियर कोपायलट हूँ। आप मुझसे गेट की स्थिति, सुविधाओं, चिकित्सा चौकियों या सुरक्षा निर्देशों के बारे में पूछ सकते हैं।"
        : "नमस्ते! मैं स्टेडियमफ्लो फैन असिस्टेंट हूँ। मैं आपकी गेट, सीट, प्राथमिक चिकित्सा, और मार्ग खोजने में सहायता कर सकता हूँ। कृपया अपना प्रश्न पूछें।",
      suggestedFollowups: ["गेट की स्थिति क्या है?", "चिकित्सा केंद्र कहाँ है?"],
      detectedIntent: "general_greeting"
    };
  }

  // 1b. Language: Hinglish
  if (language === 'hinglish') {
    if (query.includes('restroom') || query.includes('toilet') || query.includes('washroom') || query.includes('saaf')) {
      return {
        reply: "Concourse par do main restroom blocks hain: Ek North Concourse Link ke paas aur dusra South Concourse Link ke paas. Dono completely accessible aur wheelchair-friendly hain.",
        suggestedFollowups: ["Restroom kahan hain?", "Kya wheelchair access hai?"],
        detectedIntent: "amenity_lookup"
      };
    }
    if (query.includes('medical') || query.includes('injury') || query.includes('first aid') || query.includes('chot') || query.includes('doctor')) {
      const activeMedicalInc = stadiumState.incidents.find(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED');
      let reply = "East Lower Stand (Section 101) ke paas First Aid Station East open aur functional hai.";
      if (activeMedicalInc) {
        reply += " Note: Section 101 ke paas abhi ek medical dispatch incident active hai, lekin medical crew space me loaded hai.";
      }
      return {
        reply,
        suggestedFollowups: ["Nearest medical block?", "Emergency exit kahan hai?"],
        detectedIntent: "medical_lookup"
      };
    }
    if (query.includes('gate') || query.includes('entry') || query.includes('turnstile') || query.includes('bheed') || query.includes('crowd')) {
      const gateB = stadiumState.zones.find(z => z.id === 'ZONE_GATE_B');
      const gateBOccupancy = gateB ? Math.round((gateB.currentOccupancy / gateB.capacity) * 100) : 0;
      
      let reply = "Gate A currently open hai aur wahan bheed bohot kam hai. Aap aasaani se enter kar sakte hain.";
      if (gateBOccupancy >= 90) {
        reply += ` Warning: Gate B par heavy congestion (${gateBOccupancy}% capacity loaded) chal raha hai aur line bohot lambi hai. Hum suggest karte hain ki aap Gate A use karein.`;
      }
      return {
        reply,
        suggestedFollowups: ["Gate A kahan hai?", "Gate B status?"],
        detectedIntent: "crowd_lookup"
      };
    }
    if (query.includes('shuttle') || query.includes('transit') || query.includes('bus') || query.includes('metro') || query.includes('station')) {
      return {
        reply: "Stadium ke outside Metro & Shuttle Bus Plaza (Transit Plaza) directly connected hai. Gate A ya Gate B dono exits se aap wahan walk kar sakte hain.",
        suggestedFollowups: ["Transit Plaza kahan hai?", "Metro timing?"],
        detectedIntent: "transit_lookup"
      };
    }
    // Default Hinglish fallback
    return {
      reply: role === 'volunteer' 
        ? "Namaste! Main aapka Ground Volunteer Copilot hoon. Aap mujhse gates, restrooms, medical points ya emergency actions ke baare me grounded sawal puch sakte hain."
        : "Namaste! Main StadiumFlow Fan Assistant hoon. Main aapki gates, seats, medical aid, aur route preferences me help kar sakta hoon. Please detail sawal likhein.",
      suggestedFollowups: ["Gate status kya hai?", "Medical station kahan hai?"],
      detectedIntent: "general_greeting"
    };
  }

  // 2. Language: Spanish
  if (language === 'es') {
    if (query.includes('baño') || query.includes('sanitario') || query.includes('aseo')) {
      return {
        reply: "Hay dos bloques principales de baños en el estadio: uno cerca del enlace del Concurso Norte y otro cerca del Concurso Sur. Ambos son totalmente accesibles.",
        suggestedFollowups: ["¿Dónde están los baños?", "¿Tienen acceso para sillas?"],
        detectedIntent: "amenity_lookup"
      };
    }
    if (query.includes('medico') || query.includes('herida') || query.includes('primeros auxilios') || query.includes('doctor')) {
      return {
        reply: "La Estación de Primeros Auxilios Este está abierta y ubicada en la Tribuna Este Inferior (Sección 101).",
        suggestedFollowups: ["¿Dónde está primeros auxilios?", "¿Hay una camilla disponible?"],
        detectedIntent: "medical_lookup"
      };
    }
    if (query.includes('puerta') || query.includes('entrada') || query.includes('acceso') || query.includes('congestion')) {
      return {
        reply: "La Puerta A tiene poco tráfico actualmente. La Puerta B está experimentando una congestión significativa; recomendamos usar la Puerta A.",
        suggestedFollowups: ["¿Cómo llego a la Puerta A?", "¿Está abierta la Puerta B?"],
        detectedIntent: "crowd_lookup"
      };
    }
    // Default Spanish fallback
    return {
      reply: "¡Hola! Soy tu asistente de StadiumFlow. Pregúntame sobre accesos, baños, puntos médicos o transporte público.",
      suggestedFollowups: ["¿Estado de puertas?", "¿Dónde hay transporte?"],
      detectedIntent: "general_greeting"
    };
  }

  // 3. Language: English (Default)
  if (query.includes('restroom') || query.includes('toilet') || query.includes('washroom') || query.includes('bathroom')) {
    return {
      reply: "There are two main restroom blocks available: one at the North Concourse Link and another at the South Concourse Link. Both are fully step-free and accessible.",
      suggestedFollowups: ["Show me restrooms on map", "Are they wheelchair friendly?"],
      detectedIntent: "amenity_lookup"
    };
  }
  if (query.includes('medical') || query.includes('first aid') || query.includes('injury') || query.includes('hospital') || query.includes('doctor')) {
    return {
      reply: "The First Aid Station East is located near Section 101 (Lower Stand East). It is fully open, staffed, and wheelchair accessible.",
      suggestedFollowups: ["Nearest medical center", "Emergency exit routes"],
      detectedIntent: "medical_lookup"
    };
  }
  if (query.includes('gate') || query.includes('entry') || query.includes('congest') || query.includes('crowd') || query.includes('traffic')) {
    const gateB = stadiumState.zones.find(z => z.id === 'ZONE_GATE_B');
    const gateBOccupancy = gateB ? Math.round((gateB.currentOccupancy / gateB.capacity) * 100) : 0;
    
    let reply = "Gate A (Main Entry) has minimal crowd load and is recommended for swift entrance.";
    if (gateBOccupancy >= 90) {
      reply += ` Warning: Gate B is currently heavily congested at ${gateBOccupancy}% capacity load with long queue wait times. We advise rerouting to Gate A.`;
    }
    return {
      reply,
      suggestedFollowups: ["How to reach Gate A", "Gate B wait times"],
      detectedIntent: "crowd_lookup"
    };
  }
  if (query.includes('transit') || query.includes('bus') || query.includes('shuttle') || query.includes('metro') || query.includes('train')) {
    return {
      reply: "The Metro & Shuttle Bus Plaza (Transit Hub) is situated right outside the stadium gates. Both Gate A and Gate B exits connect directly to it via accessible walking pathways.",
      suggestedFollowups: ["Where is the bus plaza?", "Metro schedules"],
      detectedIntent: "transit_lookup"
    };
  }

  // Default English fallback
  return {
    reply: role === 'volunteer'
      ? "Hello! I am your Ground Volunteer Copilot. Ask me about gate status, amenities, medical posts, or safety escalation guidelines."
      : "Hello! I am the StadiumFlow Fan Assistant. I can help you find gates, restrooms, medical points, or compute step-free navigation. What can I do for you today?",
    suggestedFollowups: ["What is the crowd load at Gate B?", "Where is the nearest first aid?"],
    detectedIntent: "general_greeting"
  };
}
