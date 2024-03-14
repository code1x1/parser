import React from "react"

interface IndexAppProps {
    active: boolean; // {"description":"hallo"}
    size: number;
    title: string;
    content: JSX.Element;
    list: string[]; // {"description":"list mit strings", "default":"['']"}
    onAction: () => void;
}

export function IndexApp(props: IndexAppProps) {
    return (
        <>test</>
    )
}