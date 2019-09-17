import * as React from 'react';
import {createImportedTracker} from "../tracker";
import {ImportedTracker} from "../types";

export const PrefetchChunkCollectorContext = React.createContext<ImportedTracker>(createImportedTracker());

export const WebpackImportedProvider: React.FC<{
  tracker?: ImportedTracker;
}> = ({children, tracker = createImportedTracker()}) => (
  <PrefetchChunkCollectorContext.Provider value={tracker}>
    {children}
  </PrefetchChunkCollectorContext.Provider>
);