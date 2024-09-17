import { useState, useEffect, useCallback } from 'react';

export function useVoiceRecognition(initialInput: string, setUserInput: (input: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const startListening = useCallback(() => {
    setIsListening(true);
    setInterimTranscript('');
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setUserInput(prevInput => (prevInput + ' ' + finalTranscript).trim());
        setInterimTranscript(interimTranscript);
      };

      if (isListening) {
        recognition.start();
      } else {
        recognition.stop();
      }

      return () => {
        recognition.stop();
      };
    }
  }, [isListening, setUserInput]);

  return { isListening, startListening, stopListening, interimTranscript };
}