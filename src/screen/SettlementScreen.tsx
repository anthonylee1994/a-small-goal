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
        <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center p-5 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-(--border) bg-(--accent) text-5xl shadow-[4px_4px_0_var(--border)]" aria-hidden="true">
                {isDead ? "💀" : "🥂"}
            </div>

            <div className="space-y-2 my-4">
                <h1 className="text-3xl font-black" style={{fontFamily: "var(--font-display)"}}>
                    {isDead ? "猝死結算" : "退休結算"}
                </h1>
                <p className="text-sm text-(--muted)">
                    {family ? `出身：${family.name}` : null}
                    {family ? " · " : null}
                    {state.age} 歲
                </p>
            </div>

            <section className="rounded-2xl border-4 border-(--border) bg-white p-4 text-left shadow-[4px_4px_0_var(--border)] mb-5">
                <h2 className="mb-3 text-lg font-black" style={{fontFamily: "var(--font-display)"}}>
                    {rank.title}
                </h2>
                <p className="mb-4 text-sm text-(--muted)">{rank.message}</p>

                <div className="grid grid-cols-1 gap-2 text-sm">
                    <Stat label="現金" value={formatMoney(cash)} />
                    <Stat label="貨物" value={formatMoney(goods)} />
                    <Stat label="公司" value={formatMoney(companies)} />
                </div>

                <p className="mt-4 text-center text-xl font-black">總資產 {formatMoney(assets)}</p>
            </section>

            <Button onClick={onRestart}>重新開始</Button>
        </main>
    );
}
