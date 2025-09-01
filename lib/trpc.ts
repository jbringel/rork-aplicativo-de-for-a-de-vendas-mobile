import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // Fallback para desenvolvimento local
  console.warn('EXPO_PUBLIC_RORK_API_BASE_URL não definida, usando fallback');
  return 'http://localhost:3000';
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: (url, options) => {
        console.log('tRPC fetch:', url);
        return fetch(url, {
          ...options,
          headers: {
            ...options?.headers,
            'Content-Type': 'application/json',
          },
        }).catch(error => {
          console.error('tRPC fetch error:', error);
          // Retornar uma resposta mock em caso de erro
          return new Response(JSON.stringify({ error: 'Network error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        });
      },
    }),
  ],
});