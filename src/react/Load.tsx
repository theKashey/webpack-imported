import * as React from 'react';

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
  <script
    async={!!async}
    defer={!async}
    crossOrigin={anonymous && "anonymous"}
    src={href}
    type={module ? "module" : undefined}
  />
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