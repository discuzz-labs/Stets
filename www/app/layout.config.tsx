import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from "next/image"

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  githubUrl: "https://github.com/solo-fox/veve",
  nav: {
    // can be JSX too!
    title: <p className='text-indigo-500'>Veve</p>
  },
  links: [
    {
      text: 'Documentation',
      url: '/docs',
      active: 'nested-url',
    },
  ],
};
