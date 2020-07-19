import * as React from 'react';

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

export interface UnknownLink {
  href: string;
  as: "script" | "style" | "font";
  type: string;
  anonymous?: boolean;
}

export type KnownLink = Omit<UnknownLink, 'as'>;
export type KnownTypedLink = Omit<UnknownLink, 'as' | 'type'>;

const LinkPrefetch: React.FC<UnknownLink> = ({href, as, type, anonymous, ...rest}) => (
  <link rel="preload" as={as} href={href} type={type} crossOrigin={anonymous && "anonymous"} {...rest} />
);

export const PrefetchFont: React.FC<KnownLink> = ({href, type, anonymous, ...rest}) => (
  <LinkPrefetch as="font" href={href} type={type} anonymous={anonymous} {...rest} />
);

export const PrefetchStyle: React.FC<KnownTypedLink> = ({href, ...rest}) => (
  <LinkPrefetch as="style" type="text/css" href={href}  {...rest} />
);

export const PrefetchScript: React.FC<KnownTypedLink> = ({href, ...rest}) => (
  <LinkPrefetch href={href} as="script" type="application/javascript" {...rest} />
);

export interface KnownScript {
  href: string;
  prefetch?: boolean;
  anonymous?: boolean;
  async?: boolean;
  module?: boolean;
}

export const LoadScript: React.FC<KnownScript> = ({
                                                    href,
                                                    prefetch = true,
                                                    anonymous,
                                                    async = true,
                                                    module,
                                                  }) => (
  <>
    {prefetch && <PrefetchScript href={href} anonymous={anonymous}/>}
    <script
      async={!!async}
      defer={!async}
      crossOrigin={anonymous && "anonymous"}
      src={href}
      type={module ? "module" : undefined}
    />
  </>
);

export interface KnownStyle {
  href: string;
}

export const LoadStyle: React.FC<KnownStyle> = ({href}) => (
  <link rel="stylesheet" href={href}/>
);

export const LoadCriticalStyle: React.FC<KnownStyle> = ({href}) => (
  <style data-href={href} data-deferred-style/>
);