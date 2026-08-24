import React, { useState, useEffect, useRef } from 'react';
import {
  nlpAPI,
  NLPQueryResult,
  PromptSuggestion,
  ConversationMessage
} from '../lib/api';

interface Props {
  navigate?: (page: string) => void;
}

export default function ConversationalAnalytics({ navigate }: Props) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);
  const [expandedSQL, setExpandedSQL] = useState<Record<string, boolean>>({});
  const [isListening, setIsListening] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSuggestions();
    initializeDefaultWelcome();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestions = async () => {
    try {
      const res = await nlpAPI.getSuggestions();
      if (res) setSuggestions(res);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  };

  const initializeDefaultWelcome = async () => {
    // Run default primary query on first load to showcase capabilities immediately!
    const defaultQuery = 'Which restaurants had the most dinner-time SLA breaches in North Zone?';
    setLoading(true);
    try {
      const res = await nlpAPI.query(defaultQuery);
      setMessages([
        {
          id: 'msg-user-0',
          role: 'user',
          content: defaultQuery,
          timestamp: new Date(Date.now() - 60000).toISOString()
        },
        {
          id: 'msg-assistant-0',
          role: 'assistant',
          content: res.answer,
          result: res,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Initial query failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await nlpAPI.query(q);
      const assistantMsg: ConversationMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        result: res,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Query execution error:', err);
      const errorMsg: ConversationMessage = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Failed to execute analytical query against the intelligence layer. Please rephrase your question or try one of the suggested prompts.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const toggleSQL = (msgId: string) => {
    setExpandedSQL(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleClearThread = () => {
    setMessages([]);
  };

  // Web Speech API Integration
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please type your query.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      setIsListening(false);
      handleSend(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div
      style={{
        flex: 1,
        background: '#0D1119',
        color: '#E8EBF2',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden'
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          padding: '16px 28px',
          background: '#141B27',
          borderBottom: '1px solid #1A2336',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                background: 'linear-gradient(90deg, #38A89D, #60A5FA)',
                color: '#0D1119',
                padding: '2px 7px',
                borderRadius: 4
              }}
            >
              PHASE 7 ENGINE
            </span>
            <span style={{ fontSize: 11, color: '#7A8499', fontFamily: "'JetBrains Mono', monospace" }}>
              CONVERSATIONAL ANALYTICS & NLP QUERY PLANNER
            </span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
            💬 Ask Pulse — Conversational Analytics
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleClearThread}
            style={{
              padding: '6px 14px',
              background: '#0D1119',
              border: '1px solid #1A2336',
              borderRadius: 6,
              color: '#7A8499',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            🗑️ Clear Chat
          </button>
        </div>
      </div>

      {/* Main Conversation Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        {/* Suggested Starter Chips if thread is empty or minimal */}
        {messages.length <= 2 && suggestions.length > 0 && (
          <div
            style={{
              background: '#141B27',
              border: '1px solid #1A2336',
              borderRadius: 8,
              padding: '20px',
              marginBottom: 10
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#F5A623', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>💡 SUGGESTED OPERATIONAL QUESTIONS FOR DISPATCH MANAGERS:</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
              {suggestions.flatMap(cat =>
                cat.prompts.slice(0, 2).map((prompt, i) => (
                  <button
                    key={`${cat.category}-${i}`}
                    onClick={() => handleSend(prompt)}
                    style={{
                      background: '#0D1119',
                      border: '1px solid #1A2336',
                      borderRadius: 6,
                      padding: '10px 14px',
                      color: '#C4CAD9',
                      fontSize: 12,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={e => (e.currentTarget.style.borderColor = '#38A89D')}
                    onMouseOut={e => (e.currentTarget.style.borderColor = '#1A2336')}
                  >
                    <span>{cat.icon}</span>
                    <span style={{ flex: 1 }}>{prompt}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                width: '100%'
              }}
            >
              {/* User Bubble */}
              {isUser ? (
                <div
                  style={{
                    maxWidth: '75%',
                    background: '#1A2336',
                    border: '1px solid #242E40',
                    color: '#FFFFFF',
                    borderRadius: '12px 12px 2px 12px',
                    padding: '12px 18px',
                    fontSize: 14,
                    fontWeight: 500,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: '#F5A623', fontWeight: 700 }}>OPERATIONS MANAGER</span>
                    <span style={{ fontSize: 10, color: '#5A6478' }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {msg.content}
                </div>
              ) : (
                /* Assistant Bubble */
                <div
                  style={{
                    width: '100%',
                    maxWidth: '900px',
                    background: '#141B27',
                    border: '1px solid #1A2336',
                    borderRadius: '12px 12px 12px 2px',
                    padding: '24px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #38A89D, #60A5FA)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          color: '#0D1119',
                          fontWeight: 700
                        }}
                      >
                        ⚡
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>PEAKPULSE ANALYTICS ENGINE</span>
                      {msg.result && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: '#0D1119',
                            color: '#38A89D',
                            fontFamily: "'JetBrains Mono', monospace"
                          }}
                        >
                          {(msg.result.confidenceScore * 100).toFixed(0)}% Match • {msg.result.executionTimeMs}ms
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: '#5A6478' }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>

                  {/* Executive Summary Markdown Text */}
                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: '#E8EBF2',
                      marginBottom: 20
                    }}
                  >
                    {msg.content}
                  </div>

                  {/* In-Chat Visual Chart Rendering */}
                  {msg.result && msg.result.chartData && msg.result.chartData.length > 0 && (
                    <div
                      style={{
                        background: '#0D1119',
                        border: '1px solid #1A2336',
                        borderRadius: 8,
                        padding: '18px 20px',
                        marginBottom: 20
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#F5A623', marginBottom: 14 }}>
                        📊 {msg.result.chartTitle || 'Analytical Breakdown'}
                      </div>

                      {/* Bar Chart Mode */}
                      {msg.result.chartType === 'bar' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {msg.result.chartData.map((d, i) => {
                            const maxVal = Math.max(...msg.result!.chartData.map(x => x.value));
                            const pct = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
                            return (
                              <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                                  <span style={{ color: '#C4CAD9', fontWeight: 600 }}>{d.label}</span>
                                  <span style={{ color: d.color || '#38A89D', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                                    {d.value} {d.unit} {d.secondaryValue ? `(${d.secondaryValue}m avg prep)` : ''}
                                  </span>
                                </div>
                                <div style={{ height: 8, background: '#141B27', borderRadius: 4, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${pct}%`,
                                      height: '100%',
                                      background: d.color || '#38A89D',
                                      borderRadius: 4,
                                      transition: 'width 0.4s ease'
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Pie / Factor Decomposition Mode */}
                      {msg.result.chartType === 'pie' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                          {msg.result.chartData.map((d, i) => (
                            <div
                              key={i}
                              style={{
                                background: '#141B27',
                                border: '1px solid #1A2336',
                                borderRadius: 6,
                                padding: '12px'
                              }}
                            >
                              <div style={{ fontSize: 11, color: '#7A8499', marginBottom: 4 }}>{d.label}</div>
                              <div style={{ fontSize: 18, fontWeight: 700, color: d.color || '#F5A623', fontFamily: "'JetBrains Mono', monospace" }}>
                                {d.value}%
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* KPI Scorecard Mode */}
                      {msg.result.chartType === 'kpi' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                          {msg.result.chartData.map((d, i) => (
                            <div
                              key={i}
                              style={{
                                background: '#141B27',
                                border: '1px solid #1A2336',
                                borderRadius: 6,
                                padding: '12px'
                              }}
                            >
                              <div style={{ fontSize: 10, color: '#7A8499', marginBottom: 4 }}>{d.label.toUpperCase()}</div>
                              <div style={{ fontSize: 18, fontWeight: 700, color: d.color || '#38A89D', fontFamily: "'JetBrains Mono', monospace" }}>
                                {d.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Formatted Table Data if present */}
                  {msg.result && msg.result.tableData && msg.result.tableData.length > 0 && (
                    <div
                      style={{
                        background: '#0D1119',
                        border: '1px solid #1A2336',
                        borderRadius: 8,
                        padding: '14px',
                        marginBottom: 20,
                        overflowX: 'auto'
                      }}
                    >
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #1A2336', color: '#7A8499', textAlign: 'left' }}>
                            <th style={{ padding: '6px 8px' }}>RANK</th>
                            <th style={{ padding: '6px 8px' }}>RESTAURANT</th>
                            <th style={{ padding: '6px 8px' }}>ZONE</th>
                            <th style={{ padding: '6px 8px' }}>DINNER BREACHES</th>
                            <th style={{ padding: '6px 8px' }}>AVG PREP</th>
                            <th style={{ padding: '6px 8px' }}>PRIMARY BOTTLENECK</th>
                          </tr>
                        </thead>
                        <tbody>
                          {msg.result.tableData.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #141B27' }}>
                              <td style={{ padding: '8px', color: '#F5A623', fontWeight: 700 }}>#{row.rank}</td>
                              <td style={{ padding: '8px', color: '#FFFFFF', fontWeight: 600 }}>{row.restaurant}</td>
                              <td style={{ padding: '8px', color: '#7A8499' }}>{row.zone}</td>
                              <td style={{ padding: '8px', color: '#EF4444', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                                {row.dinnerBreaches} ({row.breachRate})
                              </td>
                              <td style={{ padding: '8px', color: '#60A5FA' }}>{row.avgPrepTime}</td>
                              <td style={{ padding: '8px', color: '#C4CAD9' }}>{row.primaryCause}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Key Operational Takeaways */}
                  {msg.result && msg.result.keyTakeaways && msg.result.keyTakeaways.length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#F5A623', marginBottom: 8 }}>
                        ⚡ OPERATIONAL TAKEAWAYS & ACTIONABLE MITIGATIONS:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {msg.result.keyTakeaways.map((item, i) => (
                          <div key={i} style={{ fontSize: 12, color: '#C4CAD9', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <span style={{ color: '#F5A623' }}>•</span>
                            <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transparent SQL & Analytical Query Plan Accordion */}
                  {msg.result && (
                    <div style={{ marginBottom: 18 }}>
                      <button
                        onClick={() => toggleSQL(msg.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#60A5FA',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: 0
                        }}
                      >
                        <span>{expandedSQL[msg.id] ? '▼' : '▶'}</span>
                        <span>Show Analytical Query Plan & Generated SQL ({msg.result.queryPlan.intent})</span>
                      </button>

                      {expandedSQL[msg.id] && (
                        <div
                          style={{
                            marginTop: 10,
                            background: '#0D1119',
                            border: '1px solid #1A2336',
                            borderRadius: 6,
                            padding: '14px',
                            fontSize: 11
                          }}
                        >
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                            {msg.result.queryPlan.entities.normalizedZone && (
                              <span style={{ background: '#141B27', padding: '2px 6px', borderRadius: 4, color: '#F5A623' }}>
                                Zone: {msg.result.queryPlan.entities.normalizedZone}
                              </span>
                            )}
                            {msg.result.queryPlan.entities.mealWindow && (
                              <span style={{ background: '#141B27', padding: '2px 6px', borderRadius: 4, color: '#60A5FA' }}>
                                Window: {msg.result.queryPlan.entities.mealWindow} ({msg.result.queryPlan.entities.hourRange?.start}:00-{msg.result.queryPlan.entities.hourRange?.end}:00)
                              </span>
                            )}
                            {msg.result.queryPlan.entities.groupBy && (
                              <span style={{ background: '#141B27', padding: '2px 6px', borderRadius: 4, color: '#38A89D' }}>
                                Group By: {msg.result.queryPlan.entities.groupBy}
                              </span>
                            )}
                          </div>
                          <pre
                            style={{
                              margin: 0,
                              fontFamily: "'JetBrains Mono', monospace",
                              color: '#A78BFA',
                              fontSize: 11,
                              overflowX: 'auto',
                              whiteSpace: 'pre-wrap'
                            }}
                          >
                            {msg.result.generatedSQL}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Smart Follow-Up Suggestions */}
                  {msg.result && msg.result.suggestedFollowUps && msg.result.suggestedFollowUps.length > 0 && (
                    <div style={{ borderTop: '1px solid #1A2336', paddingTop: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#7A8499', letterSpacing: '0.08em', marginBottom: 8 }}>
                        SUGGESTED DRILL-DOWNS & FOLLOW-UP QUESTIONS:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {msg.result.suggestedFollowUps.map((fu, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(fu)}
                            style={{
                              background: '#0D1119',
                              border: '1px solid #1A2336',
                              borderRadius: 4,
                              padding: '5px 10px',
                              color: '#60A5FA',
                              fontSize: 11,
                              cursor: 'pointer',
                              textAlign: 'left'
                            }}
                          >
                            ↳ {fu}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div
            style={{
              background: '#141B27',
              border: '1px solid #1A2336',
              borderRadius: 8,
              padding: '16px 20px',
              maxWidth: 400,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#38A89D',
                animation: 'pulse 1.2s infinite'
              }}
            />
            <span style={{ fontSize: 12, color: '#C4CAD9' }}>
              Parsing semantic entities & executing analytical query plan...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div
        style={{
          padding: '16px 32px 24px 32px',
          background: '#141B27',
          borderTop: '1px solid #1A2336'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#0D1119',
            border: `1px solid ${isListening ? '#EF4444' : '#1A2336'}`,
            borderRadius: 8,
            padding: '6px 12px',
            gap: 10,
            boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none'
          }}
        >
          <button
            onClick={handleVoiceInput}
            title={isListening ? 'Listening...' : 'Click for speech-to-text input'}
            style={{
              background: isListening ? '#EF4444' : 'transparent',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: isListening ? '#FFFFFF' : '#7A8499',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            🎤
          </button>

          <input
            type="text"
            placeholder="Ask an operational question (e.g. 'Which restaurants had the most dinner-time SLA breaches in North Zone?')..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: 13,
              outline: 'none'
            }}
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            style={{
              padding: '8px 18px',
              background: inputQuery.trim() && !loading ? 'linear-gradient(90deg, #38A89D, #60A5FA)' : '#242E40',
              border: 'none',
              borderRadius: 6,
              color: inputQuery.trim() && !loading ? '#0D1119' : '#5A6478',
              fontSize: 12,
              fontWeight: 700,
              cursor: inputQuery.trim() && !loading ? 'pointer' : 'not-allowed'
            }}
          >
            🚀 Send
          </button>
        </div>
      </div>
    </div>
  );
}
