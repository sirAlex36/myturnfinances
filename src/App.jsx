import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  History, 
  Settings, 
  X, 
  Trash2, 
  RefreshCw, 
  Search,
  Clock,
  ArrowDownLeft,
  ArrowUpRight as ArrowUpRightIcon,
  Wallet,
  Plus,
  Activity
} from 'lucide-react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('trade');
  const [baseBalance, setBaseBalance] = useState(20000.00); 
  const [accountNumber, setAccountNumber] = useState("7730194");
  const [serverName, setServerName] = useState("Vantage-Live 3");
  const [userName, setUserName] = useState("Nimrod Kiprotich");
  
  const [symbols, setSymbols] = useState([
    { symbol: 'EURUSD', bid: 1.08421, ask: 1.08423, spread: 2, digits: 5, lastDir: null },
    { symbol: 'GBPUSD', bid: 1.26543, ask: 1.26547, spread: 4, digits: 5, lastDir: null },
    { symbol: 'USDJPY', bid: 148.125, ask: 148.138, spread: 13, digits: 3, lastDir: null },
    { symbol: 'XAUUSD', bid: 2024.45, ask: 2024.95, spread: 50, digits: 2, lastDir: null },
    { symbol: 'BTCUSD', bid: 52140.50, ask: 52155.10, spread: 1460, digits: 2, lastDir: null },
  ]);

  const [trades, setTrades] = useState([
    { 
      id: 449210, 
      symbol: 'XAUUSD', 
      type: 'buy', 
      size: 0.50, 
      openPrice: 2018.45, 
      currentPrice: 2024.45, 
      profit: 300.00,
      time: '2024.02.16 10:30',
      isManualProfit: false 
    },
  ]);

  const [history, setHistory] = useState([
    { id: 1001, type: 'deposit', amount: 5000.00, method: 'USDT (TRC20)', account: 'Wallet...4x92', time: '2024.02.01 09:00' },
    { id: 1002, type: 'trade', symbol: 'EURUSD', tradeType: 'buy', size: 0.10, openPrice: 1.08210, closePrice: 1.08450, profit: 24.00, time: '2024.02.14 10:45' },
    { id: 1003, type: 'withdrawal', amount: -200.00, method: 'Visa Card', account: '**** 4421', time: '2024.02.15 14:20' },
  ]);

  const [showAdmin, setShowAdmin] = useState(false);
  const [closingTrade, setClosingTrade] = useState(null);

  // Market Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSymbols(prev => prev.map(s => {
        const change = (Math.random() - 0.5) * (10 / Math.pow(10, s.digits));
        const newBid = s.bid + change;
        const newAsk = newBid + (s.spread / Math.pow(10, s.digits));
        return { ...s, bid: newBid, ask: newAsk, lastDir: change > 0 ? 'up' : 'down' };
      }));

      setTrades(prev => prev.map(t => {
        if (t.isManualProfit) return t; // Skip logic if manually overridden
        
        const symbolData = symbols.find(s => s.symbol === t.symbol);
        if (symbolData) {
          const diff = t.type === 'buy' ? (symbolData.bid - t.openPrice) : (t.openPrice - symbolData.ask);
          const points = diff * Math.pow(10, symbolData.digits);
          const valuePerPoint = (t.size * 10); 
          return { ...t, currentPrice: t.type === 'buy' ? symbolData.bid : symbolData.ask, profit: points * valuePerPoint / 100 };
        }
        return t;
      }));
    }, 800);
    return () => clearInterval(interval);
  }, [symbols]);

  const totals = useMemo(() => {
    const closedTradesPnL = history.filter(h => h.type === 'trade').reduce((acc, h) => acc + (h.profit || 0), 0);
    const depositsSum = history.filter(h => h.type === 'deposit').reduce((acc, h) => acc + (h.amount || 0), 0);
    const withdrawalsSum = history.filter(h => h.type === 'withdrawal').reduce((acc, h) => acc + (h.amount || 0), 0);
    const floatingPnL = trades.reduce((acc, t) => acc + (t.profit || 0), 0);
    const finalBalance = baseBalance + closedTradesPnL + depositsSum + withdrawalsSum;
    return { 
      balance: finalBalance, 
      equity: finalBalance + floatingPnL, 
      floatingPnL, 
      historyTotal: closedTradesPnL, 
      deposits: depositsSum, 
      withdrawals: Math.abs(withdrawalsSum) 
    };
  }, [history, trades, baseBalance]);

  const closePosition = (id) => {
    const trade = trades.find(t => t.id === id);
    if (trade) {
      setHistory([{ 
        id: Date.now(), type: 'trade', symbol: trade.symbol, tradeType: trade.type, 
        size: trade.size, openPrice: trade.openPrice, closePrice: trade.currentPrice, 
        profit: trade.profit, time: new Date().toISOString().replace('T', ' ').substring(0, 16)
      }, ...history]);
      setTrades(prev => prev.filter(t => t.id !== id));
      setClosingTrade(null);
    }
  };

  const addNewTrade = () => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}.${(now.getMonth()+1).toString().padStart(2,'0')}.${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const newTrade = {
      id: Math.floor(Math.random() * 900000) + 100000,
      symbol: 'EURUSD',
      type: 'buy',
      size: 0.10,
      openPrice: symbols.find(s => s.symbol === 'EURUSD')?.bid || 1.08000,
      currentPrice: 1.08000,
      profit: 0.00,
      time: timeStr,
      isManualProfit: false
    };
    setTrades([newTrade, ...trades]);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white font-sans overflow-hidden max-w-md mx-auto relative border-x border-[#222]">
      <style>{`
        .custom-scroll::-webkit-scrollbar { display: none; }
        .mt-blue { color: #3b82f6; }
        .mt-red { color: #ef4444; }
        .mt-green { color: #10b981; }
        .bg-mt-blue { background-color: rgba(59, 130, 246, 0.15); }
        .bg-mt-red { background-color: rgba(239, 68, 68, 0.15); }
        input[type="number"]::-webkit-inner-spin-button, 
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

      {/* ADMIN PANEL */}
      {showAdmin && (
        <div className="absolute inset-0 z-50 bg-[#0a0a0a] overflow-y-auto custom-scroll pb-24 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between p-4 border-b border-[#333] bg-[#1a1a1a] sticky top-0 z-20">
            <h2 className="text-lg font-bold mt-blue">Control Panel</h2>
            <button onClick={() => setShowAdmin(false)} className="p-2 bg-[#333] rounded-full"><X size={20}/></button>
          </div>
          
          <div className="p-4 space-y-6">
            <section className="bg-[#111] p-4 rounded-xl border border-[#222] space-y-4">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Master Account</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-gray-500 uppercase">Principal Balance</span>
                  <input type="number" value={baseBalance || ""} onChange={(e) => setBaseBalance(Number(e.target.value))} className="bg-black border border-[#333] p-2 rounded text-blue-400 font-mono text-xs outline-none focus:border-blue-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-gray-500 uppercase">Owner Name</span>
                  <input type="text" value={userName || ""} onChange={(e) => setUserName(e.target.value)} className="bg-black border border-[#333] p-2 rounded text-white text-xs outline-none focus:border-blue-500" />
                </div>
              </div>
            </section>

            {/* CUSTOM TRADES SECTION */}
            <section className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={12}/> Active Positions
                </h3>
                <button onClick={addNewTrade} className="text-blue-500 text-[8px] border border-blue-500/20 px-2 py-1 rounded font-black">+ NEW POSITION</button>
              </div>

              {trades.map(trade => (
                <div key={trade.id} className="bg-[#111] border border-[#333] p-3 rounded-xl space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <select 
                        value={trade.symbol || ""} 
                        onChange={(e) => setTrades(trades.map(t => t.id === trade.id ? {...t, symbol: e.target.value} : t))}
                        className="bg-black text-[10px] font-bold text-white border border-[#333] rounded px-1 h-6 outline-none"
                      >
                        {symbols.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol}</option>)}
                      </select>
                      <select 
                        value={trade.type || "buy"} 
                        onChange={(e) => setTrades(trades.map(t => t.id === trade.id ? {...t, type: e.target.value} : t))}
                        className={`bg-black text-[10px] font-bold uppercase border border-[#333] rounded px-1 h-6 outline-none ${trade.type === 'buy' ? 'text-blue-400' : 'text-red-400'}`}
                      >
                        <option value="buy">BUY</option>
                        <option value="sell">SELL</option>
                      </select>
                    </div>
                    <button onClick={() => setTrades(trades.filter(t => t.id !== trade.id))} className="text-red-900 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <label className="text-[7px] text-gray-500 uppercase">Entry Time</label>
                      <input 
                        type="text" 
                        value={trade.time || ""} 
                        onChange={(e) => setTrades(trades.map(t => t.id === trade.id ? {...t, time: e.target.value} : t))} 
                        className="bg-black p-2 border border-[#333] rounded font-mono text-[10px] text-gray-400 focus:border-blue-500 outline-none" 
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[7px] text-gray-500 uppercase">Lots</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={trade.size || ""} 
                        onChange={(e) => setTrades(trades.map(t => t.id === trade.id ? {...t, size: Number(e.target.value)} : t))} 
                        className="bg-black p-2 border border-[#333] rounded font-mono text-xs text-white focus:border-blue-500 outline-none" 
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[7px] text-gray-500 uppercase">Entry Price</label>
                      <input 
                        type="number" 
                        step="0.00001"
                        value={trade.openPrice || ""} 
                        onChange={(e) => setTrades(trades.map(t => t.id === trade.id ? {...t, openPrice: Number(e.target.value)} : t))} 
                        className="bg-black p-2 border border-[#333] rounded font-mono text-xs text-gray-500 focus:border-blue-500 outline-none" 
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className={`text-[7px] uppercase font-bold ${(trade.profit || 0) >= 0 ? 'text-blue-400' : 'text-red-400'}`}>Profit / Loss ($)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01"
                          value={trade.profit || ""} 
                          onChange={(e) => setTrades(trades.map(t => t.id === trade.id ? {...t, profit: Number(e.target.value), isManualProfit: true} : t))} 
                          className={`w-full bg-black p-2 border border-[#333] rounded font-mono text-xs font-bold outline-none focus:border-blue-500 ${(trade.profit || 0) >= 0 ? 'mt-blue' : 'mt-red'}`} 
                        />
                        {trade.isManualProfit && (
                          <button onClick={() => setTrades(trades.map(t => t.id === trade.id ? {...t, isManualProfit: false} : t))} className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-gray-600 hover:text-blue-500 uppercase font-bold">Auto</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* LEDGER ENTRIES */}
            <section className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">History & Ledger</h3>
                <div className="flex gap-2">
                   <button onClick={() => setHistory([{id: Date.now(), type: 'deposit', amount: 1000, method: 'Bank Transfer', account: 'MT5 Wallet', time: '2024.02.16 09:00'}, ...history])} className="text-green-500 text-[8px] border border-green-500/20 px-2 py-1 rounded font-black">+ DEP</button>
                   <button onClick={() => setHistory([{id: Date.now(), type: 'trade', symbol: 'EURUSD', tradeType: 'buy', size: 0.1, openPrice: 1.08, closePrice: 1.09, profit: 100, time: '2024.02.16 10:00'}, ...history])} className="text-blue-500 text-[8px] border border-blue-500/20 px-2 py-1 rounded font-black">+ TRADE</button>
                </div>
              </div>

              {history.map(item => (
                <div key={item.id} className="bg-[#111] border border-[#333] p-3 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <select 
                      value={item.type || "trade"} 
                      onChange={(e) => setHistory(history.map(h => h.id === item.id ? {...h, type: e.target.value} : h))}
                      className="bg-black text-[10px] font-bold uppercase text-blue-400 border border-[#333] rounded px-1 h-6 outline-none"
                    >
                      <option value="trade">TRADE</option>
                      <option value="deposit">DEPOSIT</option>
                      <option value="withdrawal">WITHDRAWAL</option>
                    </select>
                    <button onClick={() => setHistory(history.filter(h => h.id !== item.id))} className="text-red-900 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <label className="text-[7px] text-gray-500 uppercase">Val / PnL ($)</label>
                      <input 
                        type="number" 
                        value={item.type === 'trade' ? (item.profit || "") : (item.amount || "")} 
                        onChange={(e) => setHistory(history.map(h => h.id === item.id ? (h.type === 'trade' ? {...h, profit: Number(e.target.value)} : {...h, amount: Number(e.target.value)}) : h))} 
                        className="bg-black p-2 border border-[#333] rounded font-mono text-xs text-blue-400 outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[7px] text-gray-500 uppercase">Time</label>
                      <input 
                        type="text" 
                        value={item.time || ""} 
                        onChange={(e) => setHistory(history.map(h => h.id === item.id ? {...h, time: e.target.value} : h))} 
                        className="bg-black p-2 border border-[#333] rounded font-mono text-[10px] outline-none focus:border-blue-500" 
                      />
                    </div>
                    {item.type === 'trade' ? (
                      <>
                        <div className="flex flex-col">
                          <label className="text-[7px] text-gray-500 uppercase">Symbol</label>
                          <input type="text" value={item.symbol || ""} onChange={(e) => setHistory(history.map(h => h.id === item.id ? {...h, symbol: e.target.value} : h))} className="bg-black p-2 border border-[#333] rounded text-xs" />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[7px] text-gray-500 uppercase">Side</label>
                          <input type="text" value={item.tradeType || ""} onChange={(e) => setHistory(history.map(h => h.id === item.id ? {...h, tradeType: e.target.value} : h))} className="bg-black p-2 border border-[#333] rounded text-xs" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col">
                          <label className="text-[7px] text-gray-500 uppercase">Method</label>
                          <input type="text" value={item.method || ""} onChange={(e) => setHistory(history.map(h => h.id === item.id ? {...h, method: e.target.value} : h))} className="bg-black p-2 border border-[#333] rounded text-xs text-gray-400" />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[7px] text-gray-500 uppercase">Account</label>
                          <input type="text" value={item.account || ""} onChange={(e) => setHistory(history.map(h => h.id === item.id ? {...h, account: e.target.value} : h))} className="bg-black p-2 border border-[#333] rounded text-xs text-gray-400" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>
      )}

      {/* GLOBAL HEADER */}
      <div className="p-4 pt-10 flex items-center justify-between bg-[#0a0a0a] border-b border-[#1a1a1a]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white border border-blue-400/20">{(userName || "U").charAt(0)}</div>
          <div>
            <h1 className="text-[15px] font-bold leading-none">{userName || "User"}</h1>
            <div className="flex items-center space-x-1 mt-1 text-[10px] text-gray-500 font-medium">
              <span className="px-1 rounded bg-green-500/10 text-green-500 font-bold border border-green-500/10 uppercase">Real</span>
              <span>{accountNumber} • {serverName}</span>
            </div>
          </div>
        </div>
        <button onClick={() => setShowAdmin(true)} className="p-2 bg-[#1a1a1a] rounded-full text-blue-400"><Settings size={18} /></button>
      </div>

      <div className="flex-grow overflow-y-auto custom-scroll">
        {activeScreen === 'quotes' && (
          <div className="animate-in fade-in duration-200">
            <div className="p-3 bg-[#0a0a0a] border-b border-[#1a1a1a] sticky top-0 z-10 flex items-center">
              <Search size={14} className="text-gray-600 mr-2" />
              <input placeholder="Search symbols" className="bg-transparent text-sm w-full outline-none" />
            </div>
            {symbols.map(s => (
              <div key={s.symbol} className={`flex items-center justify-between p-4 border-b border-[#111] transition-colors ${s.lastDir === 'up' ? 'bg-mt-blue' : s.lastDir === 'down' ? 'bg-mt-red' : ''}`}>
                <div>
                  <span className="font-bold text-[15px] block">{s.symbol}</span>
                  <span className="text-[9px] text-gray-600 uppercase font-bold mt-1">Spread: {s.spread}</span>
                </div>
                <div className="flex space-x-8">
                  <div className="text-right w-16">
                    <span className="block text-[8px] text-gray-600 font-bold uppercase">Bid</span>
                    <span className={`font-mono text-[14px] font-bold ${s.lastDir === 'up' ? 'mt-blue' : s.lastDir === 'down' ? 'mt-red' : 'text-white'}`}>{s.bid.toFixed(s.digits)}</span>
                  </div>
                  <div className="text-right w-16">
                    <span className="block text-[8px] text-gray-600 font-bold uppercase">Ask</span>
                    <span className={`font-mono text-[14px] font-bold ${s.lastDir === 'up' ? 'mt-blue' : s.lastDir === 'down' ? 'mt-red' : 'text-white'}`}>{s.ask.toFixed(s.digits)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeScreen === 'trade' && (
          <div className="animate-in fade-in duration-200">
            <div className="p-4 bg-gradient-to-b from-[#0a0a0a] to-black border-b border-[#1a1a1a]">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Profit</span>
                    <h2 className={`text-3xl font-bold font-mono ${totals.floatingPnL >= 0 ? 'mt-blue' : 'mt-red'}`}>
                      {totals.floatingPnL >= 0 ? '+' : ''}{totals.floatingPnL.toFixed(2)}
                    </h2>
                 </div>
                 <RefreshCw size={14} className="text-gray-800 animate-spin" />
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-12 text-[11px] font-medium">
                 <div className="flex justify-between border-b border-[#111] pb-1"><span className="text-gray-500">Balance:</span><span className="font-mono">{totals.balance.toFixed(2)}</span></div>
                 <div className="flex justify-between border-b border-[#111] pb-1"><span className="text-gray-400 font-bold">Equity:</span><span className="font-mono font-bold">{totals.equity.toFixed(2)}</span></div>
              </div>
            </div>
            {trades.map(t => (
              <div key={t.id} onClick={() => setClosingTrade(t)} className="p-4 border-b border-[#111] active:bg-[#111] flex justify-between items-center transition-colors cursor-pointer">
                 <div>
                    <div className="flex items-center space-x-2">
                       <span className="font-bold text-[15px]">{t.symbol}</span>
                       <span className={`text-[9px] px-1 rounded font-bold uppercase ${t.type === 'buy' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>{t.type} {t.size.toFixed(2)}</span>
                    </div>
                    <span className="text-[11px] text-gray-500 font-mono mt-1 block">{t.openPrice.toFixed(5)} → {t.currentPrice.toFixed(5)}</span>
                 </div>
                 <div className={`text-[17px] font-bold font-mono ${t.profit >= 0 ? 'mt-blue' : 'mt-red'}`}>{t.profit.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        {activeScreen === 'history' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-[#0a0a0a] p-5 border-b border-[#1a1a1a]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">History Report</span>
              </div>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className={`text-3xl font-mono font-bold ${totals.historyTotal >= 0 ? 'mt-blue' : 'mt-red'}`}>{totals.historyTotal.toFixed(2)} <span className="text-xs text-gray-500">USD</span></h2>
                  <p className="text-[9px] text-gray-500 mt-1 uppercase font-bold tracking-wider">Trading Result</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Balance</span>
                  <div className="text-lg font-mono font-bold mt-blue">{totals.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#111] p-2 rounded-lg border border-[#1a1a1a] text-center">
                  <span className="block text-[7px] text-gray-500 uppercase font-bold mb-1">Deposits</span>
                  <span className="text-[11px] font-mono font-bold mt-green">+{totals.deposits.toFixed(0)}</span>
                </div>
                <div className="bg-[#111] p-2 rounded-lg border border-[#1a1a1a] text-center">
                  <span className="block text-[7px] text-gray-500 uppercase font-bold mb-1">Withdraw</span>
                  <span className="text-[11px] font-mono font-bold mt-red">-{totals.withdrawals.toFixed(0)}</span>
                </div>
                <div className="bg-[#111] p-2 rounded-lg border border-[#1a1a1a] text-center">
                  <span className="block text-[7px] text-gray-500 uppercase font-bold mb-1">Profit</span>
                  <span className={`text-[11px] font-mono font-bold ${totals.historyTotal >= 0 ? 'mt-blue' : 'mt-red'}`}>{totals.historyTotal.toFixed(0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-black">
              {history.map(h => (
                <div key={h.id} className="relative group active:bg-[#0a0a0a] transition-colors border-b border-[#0f0f0f]">
                  <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${h.type === 'trade' ? ((h.profit || 0) >= 0 ? 'bg-blue-500' : 'bg-red-500') : (h.type === 'deposit' ? 'bg-green-500' : 'bg-red-500')}`} />
                  <div className="p-4 pl-5 flex justify-between items-center">
                    {h.type === 'trade' ? (
                      <>
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-[15px]">{h.symbol}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${h.tradeType?.toLowerCase()?.includes('buy') ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>{h.tradeType} {h.size?.toFixed(2)}</span>
                          </div>
                          <span className="text-[11px] text-gray-500 font-mono mt-1">{h.openPrice?.toFixed(5)} → {h.closePrice?.toFixed(5)}</span>
                          <span className="text-[9px] text-gray-600 mt-2 flex items-center"><Clock size={8} className="mr-1"/>{h.time}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-[17px] font-bold font-mono ${(h.profit || 0) >= 0 ? 'mt-blue' : 'mt-red'}`}>{(h.profit || 0) >= 0 ? '+' : ''}{(h.profit || 0).toFixed(2)}</div>
                          <div className="text-[8px] text-gray-700 font-bold uppercase">USD</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.type === 'deposit' ? 'bg-green-500/5 text-green-500 border border-green-500/10' : 'bg-red-500/5 text-red-500 border border-red-500/10'}`}>
                            {h.type === 'deposit' ? <ArrowDownLeft size={20}/> : <ArrowUpRightIcon size={20}/>}
                          </div>
                          <div>
                            <span className="font-bold text-[14px] uppercase text-gray-200">{h.type}</span>
                            <div className="text-[10px] text-gray-500 flex items-center mt-1"><Wallet size={10} className="mr-1 text-gray-700"/> {h.method} • {h.account}</div>
                            <span className="text-[9px] text-gray-600 font-medium block mt-1">{h.time}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-[16px] font-bold font-mono ${(h.amount || 0) >= 0 ? 'mt-green' : 'mt-red'}`}>{(h.amount || 0) >= 0 ? '+' : ''}{(h.amount || 0).toFixed(2)}</div>
                          <div className="text-[8px] text-gray-700 font-bold uppercase">USD</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER NAV */}
      <div className="h-16 bg-[#0a0a0a] border-t border-[#1a1a1a] flex items-center justify-around px-2 pb-2">
        <button onClick={() => setActiveScreen('quotes')} className={`flex flex-col items-center justify-center flex-grow pt-2 ${activeScreen === 'quotes' ? 'text-blue-500' : 'text-gray-600'}`}><TrendingUp size={20} /><span className="text-[9px] mt-1 font-bold">Quotes</span></button>
        <button onClick={() => setActiveScreen('trade')} className={`flex flex-col items-center justify-center flex-grow pt-2 ${activeScreen === 'trade' ? 'text-blue-500' : 'text-gray-600'}`}><ArrowUpRight size={20} /><span className="text-[9px] mt-1 font-bold">Trade</span></button>
        <button onClick={() => setActiveScreen('history')} className={`flex flex-col items-center justify-center flex-grow pt-2 ${activeScreen === 'history' ? 'text-blue-500' : 'text-gray-600'}`}><History size={20} /><span className="text-[9px] mt-1 font-bold">History</span></button>
      </div>

      {/* CLOSE POSITION MODAL */}
      {closingTrade && (
        <div className="absolute inset-0 z-[60] bg-black/95 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="w-full bg-[#111] border border-[#222] rounded-3xl p-6 shadow-2xl">
            <h3 className="text-center text-gray-600 text-[10px] uppercase font-black mb-4 tracking-[0.2em]">Close Transaction</h3>
            <div className="text-center mb-8">
              <div className="text-lg font-bold">{closingTrade.symbol} {closingTrade.type} {closingTrade.size.toFixed(2)}</div>
              <div className={`text-3xl font-mono font-bold mt-2 ${closingTrade.profit >= 0 ? 'mt-blue' : 'mt-red'}`}>{closingTrade.profit.toFixed(2)} USD</div>
            </div>
            <button onClick={() => closePosition(closingTrade.id)} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider mb-2 ${closingTrade.profit >= 0 ? 'bg-blue-600 shadow-blue-600/30 shadow-xl' : 'bg-red-600 shadow-red-600/30 shadow-xl'}`}>Close with {closingTrade.profit >= 0 ? 'Profit' : 'Loss'}</button>
            <button onClick={() => setClosingTrade(null)} className="w-full py-3 text-gray-500 font-bold text-xs uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}