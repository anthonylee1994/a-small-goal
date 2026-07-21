import type {GameState} from "../types/game";
import {BIRTH_FAMILY_MAP} from "../data/birthFamilies";
import {companyValue, getRank, inventoryValue} from "../game/engine";
import {formatMoney} from "../game/format";
import {Button} from "../components/Button";
import {Stat} from "../components/Stat";

interface Props {
    state: GameState;
    onRestart: () => void;
}

export function SettlementScreen({state, onRestart}: Props) {
    const isDead = state.phase === "dead";
    const family = state.birthFamilyId ? BIRTH_FAMILY_MAP[state.birthFamilyId] : null;
    const cash = state.cash;
    const goods = inventoryValue(state);
    const companies = companyValue(state);
    const assets = state.totalAssets ?? cash + goods + companies;
    const rank = getRank(assets);

    return (
        <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-5 py-8 text-center">
            <div className="relative mx-auto mb-2">
                <div
                    className={`mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-(--border) text-5xl shadow-[5px_5px_0_var(--border)] ${
                        isDead ? "bg-[#ffe4e6]" : "bg-(--accent)"
                    }`}
                    aria-hidden="true"
                >
                    {isDead ? "💀" : "🥂"}
                </div>
                <span
                    className="absolute -right-6 -top-2 rotate-12 rounded-lg border-2 border-(--border) bg-white px-2 py-0.5 text-[10px] font-black shadow-[2px_2px_0_var(--border)]"
                    aria-hidden="true"
                >
                    {isDead ? "GG" : "WIN?"}
                </span>
            </div>

            <div className="my-4 space-y-2">
                <h1 className="text-3xl font-black" style={{fontFamily: "var(--font-display)"}}>
                    {isDead ? "猝死結算" : "退休結算"}
                </h1>
                <p className="text-sm font-bold text-(--muted)">
                    {family ? `出身：${family.name}` : null}
                    {family ? " · " : null}
                    {state.age} 歲
                    {isDead ? " · 未活到退休" : null}
                </p>
            </div>

            <section className="mb-5 rounded-2xl border-4 border-(--border) bg-white p-4 text-left shadow-[4px_4px_0_var(--border)]">
                <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl" aria-hidden="true">
                        {rank.tier === "winner" ? "🏆" : rank.tier === "almost" ? "🦵" : rank.tier === "middle" ? "🏠" : "😵"}
                    </span>
                    <h2 className="text-lg font-black" style={{fontFamily: "var(--font-display)"}}>
                        {rank.title}
                    </h2>
                </div>
                <p className="mb-4 text-sm text-(--muted)">{rank.message}</p>

                <div className="grid grid-cols-1 gap-2 text-sm">
                    <Stat label="現金" value={formatMoney(cash)} tone={cash < 0 ? "danger" : "default"} />
                    <Stat label="貨物" value={formatMoney(goods)} />
                    <Stat label="公司" value={formatMoney(companies)} />
                </div>

                <p className="mt-4 text-center text-xl font-black">總資產 {formatMoney(assets)}</p>
            </section>

            <Button onClick={onRestart}>重新開始</Button>
        </main>
    );
}
