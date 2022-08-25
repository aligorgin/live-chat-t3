// src/pages/_app.tsx
import {withTRPC} from "@trpc/next";
import type {AppRouter} from "../server/router";
import type {AppType} from "next/dist/shared/lib/utils";
import superjson from "superjson";
import {SessionProvider} from "next-auth/react";
import {httpBatchLink} from '@trpc/client/links/httpBatchLink';
import {wsLink, createWSClient} from '@trpc/client/links/wsLink';
import "../styles/globals.css";

const MyApp: AppType = ({
                            Component,
                            pageProps: {session, ...pageProps},
                        }) => {
    return (
        <SessionProvider session={session}>
            <Component {...pageProps} />
        </SessionProvider>
    );
};

const getBaseUrl = () => {
    if (typeof window !== "undefined") return ""; // browser should use relative url
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
    return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

const url = `${getBaseUrl()}/api/trpc`;

function getEndingLink() {
    if (typeof window === 'undefined') {
        return httpBatchLink({
            url,
        })
    }

    const client = createWSClient({
        url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3011'
    })

    return wsLink({
        client
    })
}

export default withTRPC<AppRouter>({
    config({ctx}) {
        /**
         * If you want to use SSR, you need to use the server's full URL
         * @link https://trpc.io/docs/ssr
         */


        return {
            links: [getEndingLink()],
            transformer: superjson,
            /**
             * @link https://react-query.tanstack.com/reference/QueryClient
             */
            // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
            headers() {
                if (ctx?.req) {
                    return {...ctx.req.headers}
                }
                return {};
            }
        };
    },
    /**
     * @link https://trpc.io/docs/ssr
     */
    ssr: false,
})(MyApp);
