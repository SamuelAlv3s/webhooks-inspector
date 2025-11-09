import type { ComponentProps } from "react";

interface SectionDataTableProps extends ComponentProps<"table"> {
    data: {
        key: string;
        value: string;
    }[];
}
export function SectionDataTable({ data, ...props }: SectionDataTableProps) {
    return (
        <table className="w-full" {...props}>
            <tbody>
            {data.map((item) => (
                <tr key={item.key} className="border-b border-zinc-700 last:border-0">
                    <td className="p-3 text-sm font-medium text-zinc-400 bg-zinc-800/50 border-r border-zinc-700">{item.key}</td>
                    <td className="p-3 text-sm font-mono text-zinc-300">{item.value}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}