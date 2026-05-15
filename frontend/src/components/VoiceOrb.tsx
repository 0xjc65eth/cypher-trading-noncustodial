// ── Cypher Trading Non-Custodial ──
// VoiceOrb Component
// Animated voice orb that responds to listening, speaking, and idle states

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import clsx from 'clsx';

interface VoiceOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  response: string;
  onStartListening: () => void;
  onStopListening: () => void;
}

export function VoiceOrb({
  isListening,
  isSpeaking,
  transcript,
  response,
  onStartListening,
  onStopListening,
}: VoiceOrbProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Orb Container */}
      <motion.div
        className="relative cursor-pointer select-none"
        onClick={() => (isListening ? onStopListening() : onStartListening())}
        whileTap={{ scale: 0.95 }}
      >
        {/* Outer glow rings */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-cyan-500/20"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.8, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-blue-500/20"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2.5, delay: 0.5, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-purple-500/20"
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 2.6, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 3, delay: 1, ease: 'easeOut' }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Main Orb */}
        <motion.div
          className={clsx(
            'w-40 h-40 rounded-full flex items-center justify-center border-2 transition-shadow duration-500',
            isListening && 'border-cyan-400 shadow-lg shadow-cyan-500/50',
            isSpeaking && 'border-purple-400 shadow-lg shadow-purple-500/50',
            !isListening && !isSpeaking && 'border-gray-600 hover:border-cyan-400/50 shadow-lg shadow-black/50'
          )}
          style={{
            background: isListening
              ? 'radial-gradient(circle at 30% 30%, rgba(34,211,238,0.4), rgba(59,130,246,0.2), rgba(0,0,0,0.9))'
              : isSpeaking
              ? 'radial-gradient(circle at 30% 30%, rgba(168,85,247,0.4), rgba(34,211,238,0.2), rgba(0,0,0,0.9))'
              : 'radial-gradient(circle at 30% 30%, rgba(75,85,99,0.3), rgba(0,0,0,0.9))',
          }}
          animate={
            isListening
              ? {
                  scale: [1, 1.05, 1, 1.03, 1],
                  transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                }
              : isSpeaking
              ? {
                  scale: [1, 1.08, 1, 1.06, 1],
                  transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
                }
              : {}
          }
        >
          {/* Icon */}
          <motion.div
            animate={
              isListening
                ? { rotate: [0, 10, -10, 0], transition: { repeat: Infinity, duration: 3 } }
                : {}
            }
          >
            {isListening ? (
              <Mic className="w-16 h-16 text-cyan-400" />
            ) : isSpeaking ? (
              <Volume2 className="w-16 h-16 text-purple-400" />
            ) : (
              <MicOff className="w-16 h-16 text-gray-500" />
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Status Text */}
      <div className="text-center space-y-2">
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.p
              key="listening"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-cyan-400 text-lg font-medium"
            >
              🎙️ Listening... Say "Hey Cypher" or speak your command
            </motion.p>
          ) : isSpeaking ? (
            <motion.p
              key="speaking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-purple-400 text-lg font-medium"
            >
              🔊 Cypher is responding...
            </motion.p>
          ) : (
            <motion.p
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-gray-500 text-lg"
            >
              Click the orb or say "Hey Cypher"
            </motion.p>
          )}
        </AnimatePresence>

        {/* Transcript */}
        <AnimatePresence>
          {transcript && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-gray-400 text-sm max-w-md"
            >
              You said: "{transcript}"
            </motion.p>
          )}
        </AnimatePresence>

        {/* Response */}
        <AnimatePresence>
          {response && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-gray-300 text-sm max-w-md mt-2 p-3 rounded-lg bg-white/5 border border-white/10"
            >
              {response}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
