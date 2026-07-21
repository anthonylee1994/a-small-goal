import type {LucideIcon} from "lucide-react";
import {ScrollText} from "lucide-react";
import {Button} from "@/components/Button";
import {CompanySectionIcon, FamilySectionIcon, MarketSectionIcon} from "@/ui/icons";

export type GameTab = "market" | "company" | "family" | "log";

interface TabDef {
    id: GameTab;
    label: string;
    icon: LucideIcon;
}

const TABS: readonly TabDef[] = [
    {id: "market", label: "市場", icon: MarketSectionIcon},
    {id: "company", label: "創業", icon: CompanySectionIcon},
    {id: "family", label: "家庭", icon: FamilySectionIcon},
    {id: "log", label: "日誌", icon: ScrollText},
];

interface Props {
    activeTab: GameTab;
    onTabChange: (tab: GameTab) => void;
    endTurnDisabled: boolean;
    onEndTurn: () => void;
}

export const BottomPanel = ({activeTab, onTabChange, endTurnDisabled, onEndTurn}: Props) => {
    return (
        <nav className="border-t-4 border-(--border) bg-(--panel)/95 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
            <div className="flex flex-col gap-3">
                <Button variant="danger" disabled={endTurnDisabled} onClick={onEndTurn}>
                    結束今年
                </Button>

                <div className="grid grid-cols-4 gap-1.5" role="tablist" aria-label="遊戲分頁">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => onTabChange(tab.id)}
                                className={`flex flex-col items-center gap-0.5 rounded-xl border-2 border-(--border) px-1 py-2 text-[10px] font-black transition-[transform,box-shadow] active:translate-x-px active:translate-y-px active:shadow-none ${
                                    active ? "bg-(--accent) shadow-[2px_2px_0_var(--border)]" : "bg-white shadow-[2px_2px_0_var(--border)]"
                                }`}
                            >
                                <Icon className="size-5" strokeWidth={2.5} aria-hidden="true" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
