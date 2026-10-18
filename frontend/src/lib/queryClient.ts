import { QueryClient } from "@tanstack/react-query";

// Shared cache for public runtime configuration and external live-content feeds.
export const queryClient = new QueryClient();
