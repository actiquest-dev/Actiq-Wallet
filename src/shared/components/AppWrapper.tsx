import {createContext, useContext} from "react"

const AppContext = createContext({})

export function AppWrapper({children,}: Readonly<{children: React.ReactNode;}>) {
<AppContext.Provider value={{init:0}}>
    {children}
</AppContext.Provider>
}