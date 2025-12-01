import { useMemo, useState, useCallback } from 'react';
import { useRealtimeAgent } from './hooks';
import {
  createDisplayOutputTool} from './tools';
import AppHeader from './components/AppHeader';
import Main from './components/Main';
import Output from './components/Output';
import './App.css';

export interface ConversationMessage {
  id: string;
  userenglishText: string;
  userphoneticGujaratiText: string;
  pronounciationRating: string;
  aienglishText: string;
  aiphoneticGujaratiText: string;
  suggestions: string;
  timestamp: number;
}

function App() {
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  const addMessage = useCallback((message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    const newMessage: ConversationMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: Date.now()
    };
    setConversationHistory(prev => [...prev, newMessage]);
  }, []);

  const tools = useMemo(() => {
    return [
      createDisplayOutputTool(addMessage)
    ];
  }, [addMessage]);

  useRealtimeAgent(tools);

  return (
    <div className='App'>
      <AppHeader />
      <Main>
        <Output conversationHistory={conversationHistory} />
      </Main>
    </div>
  );
}

export default App;
