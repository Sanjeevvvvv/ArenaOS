import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Pre-packaged high-fidelity multilingual responses
function getMockResponse(query: string, language: string = 'en'): string {
  const q = query.toLowerCase();
  const lang = language.toLowerCase();
  
  if (lang === 'es') {
    if (q.includes('simulate') || q.includes('incident') || q.includes('emergency') || q.includes('evacuate') || q.includes('sos') || q.includes('simul')) {
      return `### 🚨 ArenaOS Informe de Simulación de Incidentes
**Protocolo Activo:** Plan de Acción de Emergencia del Estadio (SEAP-2026)

1. **Evaluación de Despacho de IA:**
   - **Gatillo:** Reporte simulado de incidente en Sector F / Puerta 3.
   - **Desviación:** Evacuación de espectadores del Sector D y F a través de North Plaza.
   - **Personal:** Reubicación de 15 guardias de seguridad al Sector D.
   - **Servicio Médico:** Envío de Unidad Médica 2 al Sección 114 (ETA 2.5 minutos).

2. **Acciones Recomendadas:**
   - [Acción] Aumentar capacidad de Autobús 14B redirigiendo 3 unidades de respaldo.
   - [Acción] Transmitir audio PA: *"Por favor sigan a los guardias hacia la Salida Norte."*
   - [Acción] Enviar notificación PWA de evacuación con mapa de rutas accesibles.`;
    }
    
    if (q.includes('crowd') || q.includes('gate') || q.includes('bottleneck') || q.includes('people') || q.includes('traffic') || q.includes('embotellamiento')) {
      return `### 📊 Análisis de Flujo y Densidad de Multitudes
**Zona Analizada:** Puerta 3 y Sector D

* **Estado Actual:** Densidad en Puerta 3 alcanza **4.2 personas/m²** (Nivel Crítico).
* **Predicción IA:** Tiempo de evacuación estimado para el Sector D es de **24 minutos**.
* **Acciones sugeridas:**
  1. **Abrir Puerta Auxiliar 3B** para aumentar el flujo de salida en un 35%.
  2. **Actualizar señalización digital** para dirigir flujos hacia Puerta 4 (actualmente con baja densidad de 1.1 pers/m²).`;
    }

    if (q.includes('accessibility') || q.includes('wheelchair') || q.includes('sensory') || q.includes('blind') || q.includes('deaf') || q.includes('elevator') || q.includes('accesib')) {
      return `### ♿ ArenaOS Centro de Accesibilidad Universal
Cumpliendo con los estándares de la FIFA y WCAG AA.

* **Ascensores ADA:** Ascensores 4 y 9 asignados para sillas de ruedas. Ascensor 4 operativo (espera: 2m).
* **Zona Sensorial:** Sala Silenciosa en Sector B (Habitación 102) a **42 dB** (ideal para relajación).
* **Despacho Automático SOS:** Al presionar SOS, un voluntario ADA es asignado a tus coordenadas de asiento.`;
    }

    return `### ¡Hola! Soy ArenaAI, tu copiloto inteligente de estadio.
Puedo ayudarte con operaciones del estadio, navegación de fanáticos, seguridad y análisis en español.

Prueba preguntándome sobre:
* **Multitudes:** *"¿Hay embotellamientos en la Puerta 3?"*
* **Simulaciones:** *"Simular emergencia médica en Sector D."*
* **Accesibilidad:** *"Buscar rutas sin escalones."*`;
  }

  if (lang === 'fr') {
    if (q.includes('simulate') || q.includes('incident') || q.includes('emergency') || q.includes('evacuate') || q.includes('sos') || q.includes('simul')) {
      return `### 🚨 ArenaOS Rapport de Simulation d'Incidents
**Protocole Actif:** Plan d'Action d'Urgence du Stade (SEAP-2026)

1. **Évaluation IA de Dispatch:**
   - **Déclencheur:** Incident simulé dans le Secteur F / Porte 3.
   - **Déviation:** Évacuation des Secteurs D et F via North Plaza.
   - **Sécurité:** Redéploiement de 15 agents de sécurité vers les sorties du Secteur D.
   - **Médical:** Unité Médicale 2 dépêchée vers Section 114 (ETA 2.5 minutes).

2. **Actions recommandées:**
   - [Action] Rerouter 3 navettes de secours vers la ligne 14B.
   - [Action] Diffuser message PA: *"Veuillez suivre les stadiers vers la sortie Nord."*
   - [Action] Pousser une alerte PWA affichant les itinéraires d'évacuation sans marche.`;
    }
    
    if (q.includes('crowd') || q.includes('gate') || q.includes('bottleneck') || q.includes('people') || q.includes('traffic') || q.includes('foule')) {
      return `### 📊 Analyse de Densité et Flux de Foule
**Zone Analysée:** Porte 3 et Rampes du Secteur D

* **Statut Actuel:** Densité à la Porte 3 atteint **4.2 personnes/m²** (Seuil élevé).
* **Prédiction IA:** L'évacuation complète du Secteur D prendra **24 minutes**.
* **Actions Proposées:**
  1. **Ouvrir la Porte Auxiliaire 3B** pour accroître le flux de sortie de 35%.
  2. **Mettre à jour les panneaux d'affichage** vers la Porte 4 (densité de 1.1 pers/m²).`;
    }

    if (q.includes('accessibility') || q.includes('wheelchair') || q.includes('sensory') || q.includes('blind') || q.includes('deaf') || q.includes('elevator') || q.includes('accessib')) {
      return `### ♿ ArenaOS Suite d'Accessibilité Universelle
Conforme aux standards d'accessibilité FIFA et WCAG AA.

* **Itinéraires PMR:** Les ascenseurs 4 et 9 sont opérationnels (attente estimée: 2 min).
* **Espace Sensoriel:** Chambre calme disponible au Secteur B (salle 102) mesurée à **42 dB**.
* **Urgence PMR:** En cas d'activation du bouton SOS, un stadier est dépêché à vos coordonnées de siège.`;
    }

    return `### Bonjour! Je suis ArenaAI, votre co-pilote de stade intelligent.
Je peux vous assister dans la gestion opérationnelle, la sécurité et l'accessibilité en français.

Vous pouvez me demander:
* **Gestion de Foule:** *"Y a-t-il des goulots d'étranglement à la Porte 3 ?"*
* **Simulation d'Incident:** *"Simuler une urgence médicale au Secteur D."*
* **Accessibilité:** *"Trouver les itinéraires pour fauteuils roulants."*`;
  }

  // DEFAULT ENGLISH
  if (q.includes('simulate') || q.includes('incident') || q.includes('emergency') || q.includes('evacuate') || q.includes('sos')) {
    return `### 🚨 ArenaOS Incident Simulation Report
**Protocol Active:** Stadium Emergency Action Plan (SEAP-2026)

1. **AI Dispatch Assessment:**
   - **Trigger:** Simulated report of incident in Sector F/Gate 3.
   - **Evacuation Protocol:** Activated partial flow redirect. Evacuating Sector D and F spectators via North Plaza gates rather than the Gate 3 bottleneck.
   - **Staff Redistribution:** Moving 15 Security Stewards from concession queues to Sector D exits.
   - **Emergency Services:** Dispatching Medical Unit 2 to Section 114 (ETA 2.5 minutes).

2. **Actionable Recommendations:**
   - [Action] Broaden Transit Shuttle 14B capacity immediately by rerouting 3 backup buses.
   - [Action] Broadcast PA audio announcements: *"Please follow corridor stewards to the North Exit Plaza."*
   - [Action] Push PWA notification to mobile devices in Sectors D and F showing step-free exit paths.`;
  }
  
  if (q.includes('crowd') || q.includes('gate') || q.includes('bottleneck') || q.includes('people') || q.includes('traffic')) {
    return `### 📊 Crowd Intelligence & Flow Analysis
**Location analyzed:** Gate 3 & Sector D Ramps

* **Current Status:** Spectator entry/exit rates at Gate 3 have reached **4.2 people/m²** (High density).
* **AI Prediction:** At the current outflow rate, exiting Sector D will take **24 minutes** (10 minutes longer than the World Cup threshold).
* **Suggested Actions:**
  1. **Open Auxiliary Gate 3B** to increase flow capacity by 35%.
  2. **Update digital wayfinding signage** at Sector D to point towards Gate 4 (which is currently under-capacity with only 1.1 people/m²).
  3. **Delay incoming transit shuttles** from entering West plaza for 5 minutes to allow crowd dispersion.`;
  }

  if (q.includes('accessibility') || q.includes('wheelchair') || q.includes('sensory') || q.includes('blind') || q.includes('deaf') || q.includes('elevator')) {
    return `### ♿ ArenaOS Accessibility Suite Information
ArenaOS is configured to WCAG AA and FIFA Accessibility standards.

* **Wheelchair Navigation:** Elevators 4 and 9 are designated as primary step-free routes. Lift 4 is currently fully operational with a 2-minute wait time.
* **Sensory Friendly Spaces:** The **Quiet Room (Sector B, Room 102)** has a current sound level of **42 dB** (ideal range) and contains sensory tools and dimmed lighting.
* **Assistive Services:**
  - *Audio Descriptive Commentary (ADC):* Available on Channel 98.7 FM.
  - *Evacuation Assist:* When SOS is pressed by a guest with accessibility needs, a dedicated volunteer is auto-dispatched to their specific seating coordinates.`;
  }

  if (q.includes('concession') || q.includes('food') || q.includes('drink') || q.includes('beer') || q.includes('taco') || q.includes('line')) {
    return `### 🍔 Concession Queue Analysis
* **Longest Queue:** *El Tri Tacos* (Sector F) has a **28-minute** wait time due to high order volume of Specialty Tacos.
* **Shortest Queue:** *Paddock Brews* (Sector C) has a **5-minute** wait.
* **AI Dining Suggestions:**
  - Suggesting fans order via the ArenaOS PWA Express Lane for *FIFA Official Merch* (Sector D) where lines have cleared.
  - Pushing 10% discount codes to users in Sector F for *Glory Hot Dogs* to balance stadium dining loads.`;
  }

  if (q.includes('transit') || q.includes('bus') || q.includes('train') || q.includes('shuttle') || q.includes('rideshare') || q.includes('parking')) {
    return `### 🚍 Smart Transit Hub Report
* **Red Line Metro:** Operating at peak frequency (4-minute intervals). No major delays.
* **Shuttle 14B:** Experiencing a **12-minute delay** due to heavy traffic on the North Outer Ring Road.
* **Rideshare Zone:** High demand. Surge pricing is active, and wait time for pickups is approximately 18 minutes.
* **AI Traffic Advisory:** Recommend taking the Red Line Metro to Downtown Station, then connecting to local lines. The walking path to the Metro Station is clear.`;
  }

  // General fallback
  return `### Hello! I am ArenaAI, your Smart Stadium Copilot.
I can assist you with stadium operations, fan navigation, safety, and analytics.

Here are some topics you can query me about:
* **Crowd & Flow:** *"Are there any bottlenecks near Gate 3?"* or *"Analyze crowd density."*
* **Incident Simulation:** *"Simulate medical emergency in Sector D."*
* **Accessibility:** *"Find step-free routes to Elevator 4"* or *"Where is the sensory quiet room?"*
* **Transit:** *"Show bus delay statuses."*
* **Concessions:** *"Which food stand has the shortest line?"*`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, systemPrompt, language } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1]?.content || '';
    const activeLang = language || 'en';

    // If Gemini API Key is missing, respond with our Multilingual Mock Engine
    if (!apiKey) {
      const reply = getMockResponse(latestMessage, activeLang);
      return NextResponse.json({ content: reply });
    }

    // Call real Google Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    // Inject translation instructions inside the system instructions
    const localizedSystemInstruction = systemPrompt 
      ? `${systemPrompt}\n\nIMPORTANT: The user's active language is ${activeLang.toUpperCase()}. You MUST reply in ${activeLang.toUpperCase()} (either English, Spanish, or French).`
      : `You are ArenaAI, a stadium operations assistant. The user's active language is ${activeLang.toUpperCase()}. You MUST reply in ${activeLang.toUpperCase()} (either English, Spanish, or French).`;

    // Format messages for Gemini API
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const apiBody = { 
      contents,
      systemInstruction: {
        parts: [{ text: localizedSystemInstruction }]
      }
    };

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini API returned error status:', res.status, errText);
      const reply = getMockResponse(latestMessage, activeLang);
      return NextResponse.json({ content: reply, note: 'Responded via mock fallback due to Gemini API failure.' });
    }

    const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      throw new Error('Empty response from Gemini API candidates');
    }

    return NextResponse.json({ content: replyText });
  } catch (error: unknown) {
    console.error('Error in API Gemini route:', error);
    return NextResponse.json({ 
      content: `I encountered an internal error while processing your request. Detail: ${error instanceof Error ? error.message : 'unknown'}` 
    });
  }
}
