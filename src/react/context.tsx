import * as React from 'react';

import type {FC, PropsWithChildren} from "react";

import {createImportedTracker} from "../tracker";
import type {ImportedTracker} from "../types";

export const PrefetchChunkCollectorContext = React.createContext<ImportedTracker>(createImportedTracker());

export const WebpackImportedProvider: FC<PropsWithChildren<{
    tracker?: ImportedTracker;
}>> = ({children, tracker = createImportedTracker()}) => (
    <PrefetchChunkCollectorContext.Provider value={tracker}>
        {children}
    </PrefetchChunkCollectorContext.Provider>
);