import { useEffect, useRef } from 'react';
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';
import { logSessionHistory } from '../utils';
import { ASSISTANT_INSTRUCTIONS, ASSISTANT_NAME, ASSISTANT_VOICE } from '../agent/config';
import type { WorkerAPIResponseData } from '../../types';

// (Agent configuration is defined in `src/app/agent/config.ts`)

// To avoid TypeScript errors from using `FunctionTool`
type RealtimeAgentTools = ConstructorParameters<typeof RealtimeAgent>[0]["tools"];

function useRealtimeAgent(tools: RealtimeAgentTools) {
  const sessionRef = useRef<RealtimeSession | null>(null);

  useEffect(() => {
    const agent = new RealtimeAgent({
      name: ASSISTANT_NAME,
      instructions: ASSISTANT_INSTRUCTIONS,
      tools: tools,
      voice: ASSISTANT_VOICE,
      // More options available, see:
      // https://openai.github.io/openai-agents-js/openai/agents/realtime/classes/realtimeagent
    });

    const session = new RealtimeSession(agent);
    sessionRef.current = session;

    const connectSession = async () => {
      try {
        const response = await fetch('/api/ephemeral-key');
        const result: WorkerAPIResponseData = await response.json();
        if (result.error || !result.data) {
          throw new Error(result.error || "No data in response");
        }
        await session.connect({ apiKey: result.data.value });
      } catch (error) {
        console.error("Failed to connect session:", error);
      }
    };

    connectSession()
      .then(() => {
        // Adding this means the agent isn't waiting for the user to initiate the conversation. 
         //session.sendMessage("[System Message] Conversation started. Please greet the user and introduce yourself.");
      });

    session.on('history_updated', (history) => {
      // Log the session history to the console whenever it updates. 
      // Expect to see incomplete history items & repetitions as the session progresses. 
      logSessionHistory(history);
    });

    return () => {
      session.close();
    };
  }, [tools]);

  return sessionRef;
}

export default useRealtimeAgent;
