'use client';

import { useCallback } from 'react';

/**
 * Makes a piece of text reach into the background network.
 *
 * Hover a technology in the stack list, or a role in the history, and the parts
 * of the system it touches light up behind the page. It's the most surprising
 * interaction here precisely because nobody expects prose to drive the ambient
 * visual — and it's the one that actually teaches something: you learn what
 * connects to what by pointing at words.
 *
 * Purely additive. Anything wrapped in this reads and behaves exactly as normal
 * text when there's no pointer, no JS, or no appetite for motion.
 */
export function useNetworkLink(ids: string[] | undefined) {
  const emit = useCallback((detail: string[] | null) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('network:highlight', { detail }));
  }, []);

  if (!ids?.length) return {};

  return {
    onPointerEnter: () => emit(ids),
    onPointerLeave: () => emit(null),
    // Keyboard parity: tabbing through the stack reveals the same relationships.
    onFocus: () => emit(ids),
    onBlur: () => emit(null),
  };
}

/**
 * Maps the human-facing names used in the copy onto nodes in the graph, so the
 * content file never has to know about network internals.
 */
export const NODE_ALIASES: Record<string, string[]> = {
  TypeScript: ['nextjs', 'launch'],
  Golang: ['golang', 'launch'],
  JavaScript: ['nextjs'],
  Lua: ['nginx'],
  Cloudflare: ['cloudflare', 'cdn'],
  Fastly: ['fastly', 'cdn'],
  Nginx: ['nginx', 'cdn'],
  Redis: ['redis', 'priming', 'origin'],
  AWS: ['launch', 'k8s'],
  GCP: ['launch', 'k8s'],
  Azure: ['launch', 'k8s'],
  Kubernetes: ['k8s', 'launch'],
  Docker: ['k8s'],
  Helm: ['k8s'],
  Terraform: ['k8s', 'launch'],
  OpenTelemetry: ['otel', 'elastic', 'launch'],
  Elasticsearch: ['elastic', 'otel'],
  CloudWatch: ['otel'],
  'Node.js': ['launch', 'nextjs'],
  React: ['nextjs'],
  'Next.js': ['nextjs', 'portfolio', 'foliobulls', 'guengg'],
  NestJS: ['launch'],
  GraphQL: ['launch'],
};

export function aliasFor(label: string): string[] | undefined {
  return NODE_ALIASES[label];
}
