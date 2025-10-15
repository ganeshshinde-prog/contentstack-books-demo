import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Header from "@/components/header";
import { CartProvider } from "@/contexts/cart-context";
import { PersonalizationProvider } from "@/contexts/personalization-context";

import 'react-loading-skeleton/dist/skeleton.css';
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Contentstack-Nextjs-Starter-App",
  applicationName: "Contentstack-Nextjs-Starter-App",
};

export const viewport: Viewport = {
  themeColor: '#317EFB',
  initialScale: 1,
  minimumScale: 1,
  width: 'device-width',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <Script
          src='https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js'
          integrity='sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM'
          crossOrigin='anonymous'
          strategy='lazyOnload'
        />
        <link rel='preconnect' href='https://fonts.gstatic.com' />
        <link
          href='https://fonts.googleapis.com/css?family=Inter&amp;display=swap'
          rel='stylesheet'
        />
        <link
          rel='stylesheet'
          href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta2/css/all.min.css'
          integrity='sha512-YWzhKL2whUzgiheMoBFwW8CKV4qpHQAEuvilg9FAn5VJUDwKZZxkJNuGM4XkWuk94WCrrwslk8yWNGmY1EduTA=='
          crossOrigin='anonymous'
          referrerPolicy='no-referrer'
        />
        <link
          href='https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css'
          rel='stylesheet'
          integrity='sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC'
          crossOrigin='anonymous'
        />
        <link
          rel='stylesheet'
          href="/styles/globals.css"
        />
        <link
          rel='stylesheet'
          href="/styles/style.css"
        />
        <link
          rel='stylesheet'
          href="/styles/third-party.css"
        />
      </head>
      <body>
        {/* Lytics Analytics Script */}
        <Script id="lytics-analytics" strategy="afterInteractive">
          {`
            !function(){"use strict";var o=window.jstag||(window.jstag={}),r=[];function n(e){o[e]=function(){for(var n=arguments.length,t=new Array(n),i=0;i<n;i++)t[i]=arguments[i];r.push([e,t])}}n("send"),n("mock"),n("identify"),n("pageView"),n("unblock"),n("getid"),n("setid"),n("loadEntity"),n("getEntity"),n("on"),n("once"),n("call"),o.loadScript=function(n,t,i){var e=document.createElement("script");e.async=!0,e.src=n,e.onload=t,e.onerror=i;var o=document.getElementsByTagName("script")[0],r=o&&o.parentNode||document.head||document.body,c=o||r.lastChild;return null!=c?r.insertBefore(e,c):r.appendChild(e),this},o.init=function n(t){return this.config=t,this.loadScript(t.src,function(){if(o.init===n)throw new Error("Load error!");o.init(o.config),function(){for(var n=0;n<r.length;n++){var t=r[n][0],i=r[n][1];o[t].apply(o,i)}r=void 0}()}),this}}();
            jstag.init({
              src: 'https://c.lytics.io/api/tag/79f175714c74eb53ab4c712603463f2b/latest.min.js'
            });
            jstag.pageView();
          `}
        </Script>

        {/* Main Personalization Provider with SDK */}
        <PersonalizationProvider>
          <CartProvider>
            <Header />
            <main className='mainClass mt-5'>
              <>
                {children}
              </>
            </main>
            <Footer />
          </CartProvider>
        </PersonalizationProvider>
      </body>
    </html>
  );
}
