import * as React from "react";

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

export interface UnknownLink {
  href: string;
  as: "script" | "style" | "font";
  type: string;
  anonymous?: boolean;
}

export type KnownLink = Omit<UnknownLink, 'as'>;
export type KnownTypedLink = Omit<UnknownLink, 'as' | 'type'>;

const LinkPreload: React.FC<UnknownLink> = ({href, as, type, anonymous, ...rest}) => (
  <link rel="preload" as={as} href={href} type={type} crossOrigin={anonymous && "anonymous"} {...rest} />
);
const LinkPrefetch: React.FC<UnknownLink> = ({href, as, type, anonymous, ...rest}) => (
  <link rel="prefetch" as={as} href={href} type={type} crossOrigin={anonymous && "anonymous"} {...rest} />
);
export const PreloadFont: React.FC<KnownLink> = ({href, type, anonymous, ...rest}) => (
  <LinkPreload as="font" href={href} type={type} anonymous={anonymous} {...rest} />
);
export const PrefetchFont: React.FC<KnownLink> = ({href, type, anonymous, ...rest}) => (
  <LinkPrefetch as="font" href={href} type={type} anonymous={anonymous} {...rest} />
);
export const PrefetchStyle: React.FC<KnownTypedLink> = ({href, ...rest}) => (
  <LinkPrefetch as="style" type="text/css" href={href}  {...rest} />
);
export const PreloadStyle: React.FC<KnownTypedLink> = ({href, ...rest}) => (
  <LinkPreload as="style" type="text/css" href={href}  {...rest} />
);
export const PrefetchScript: React.FC<KnownTypedLink> = ({href, ...rest}) => (
  <LinkPrefetch href={href} as="script" type="application/javascript" {...rest} />
);
export const PreloadScript: React.FC<KnownTypedLink> = ({href, ...rest}) => (
  <LinkPreload href={href} as="script" type="application/javascript" {...rest} />
);