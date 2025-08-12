"use client";
import { useEffect, useRef, useState } from 'react';
import { Transaction } from './transaction-table';
import { Box, Button, TextField, Typography } from '@mui/material';
import { usePathname } from 'next/navigation';

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages: { sender: 'user' | 'bot', text: string }[] = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setTyping(true);
    // Call your backend API with the question and transaction data
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages}),
    });
    const data = await res.json();
    setMessages((msgs) => [...msgs, { sender: 'bot', text: data.answer }]);
    setTyping(false);
    // Scroll to bottom
    setTimeout(() => {
      chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight);
    }, 100);
  };

  return (
    <>
      <Button
        variant="contained"
        sx={{ borderRadius: '50%', minWidth: 56, minHeight: 56 }}
        onClick={() => setOpen((o) => !o)}
      >
        💬
      </Button>
      {open && (
        <Box
          sx={{
            width: 350,
            height: 450,
            bgcolor: 'background.paper',
            boxShadow: 8,
            borderRadius: 2,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            mt: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>Ask about your transactions</Typography>
          <Box
            ref={chatWindowRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              mb: 1,
              bgcolor: '#f5f5f5',
              borderRadius: 1,
              p: 1,
            }}
          >
            {messages.map((msg, idx) => (
              <Box key={idx} sx={{ textAlign: msg.sender === 'user' ? 'right' : 'left', mb: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    display: 'inline-block',
                    bgcolor: msg.sender === 'user' ? '#1976d2' : '#e0e0e0',
                    color: msg.sender === 'user' ? '#fff' : '#000',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.text}
                </Typography>
              </Box>
            ))}
            {typing && (
              <Box sx={{ textAlign: 'left', mb: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    display: 'inline-block',
                    bgcolor: '#e0e0e0',
                    color: '#000',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontStyle: 'italic',
                  }}
                >
                  Bot is typing...
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Type your question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            />
            <Button variant="contained" onClick={handleSend}>Send</Button>
          </Box>
        </Box>
      )}
    </>
  );
}