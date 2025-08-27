import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const useRealtimeMessages = (requestId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!requestId) return;

    const requestRef = doc(db, 'requests', requestId);
    const unsubscribe = onSnapshot(requestRef, (doc) => {
      const requestData = doc.data();
      const messages = requestData?.messages || [];
      
      const sortedMessages = [...messages].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );

      queryClient.setQueryData(
        ['requests', requestId, 'messages'],
        sortedMessages
      );
    });

    return () => unsubscribe();
  }, [requestId, queryClient]);
};