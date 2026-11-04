const series=(a,b)=>Array.from({length:24},(_,i)=>Math.round(a+(b-a)*i/23+Math.sin(i/3)*3));
export const topics=['Trending','New','Live','Governance & Policy','Politics & Elections','Culture & Entertainment','Economy & Finance','Health & Science','Tech','Climate & Environment','World'];
export const subtopics=['All','AI','Business & Companies','Presidential','Film & Nollywood','Governorship','International Relations','Music','Law & Order','Monetary Policy'];
export const sortOptions=['Total volume','Liquidity','Newest','Ending soon','Competitive','Volatile'];
export const markets=[
 {id:'m1',title:'Will the CBN cut the MPR at the 307th MPC meeting on September 21-22, 2026?',prob:49,yes:59,no:41,vol:'\u20a6129.6K',ends:'57d',status:'active'},
 {id:'m2',title:'Will the APC candidate win the 2027 Lagos Governorship Election?',prob:59,yes:61,no:39,vol:'\u20a6221.3K',ends:'57d',status:'active'},
 {id:'m3',title:'Will Nigeria\'s F1 bid for Abuja be approved before 2028?',prob:24,yes:24,no:76,vol:'\u20a6375K',ends:'422d',status:'active'},
 {id:'m4',title:'Will Nigeria\'s food import bill fall below $2.0bn in 2026?',prob:65,yes:65,no:35,vol:'\u20a6662.8K',ends:'56d',status:'active'},
 {id:'m5',title:'Will the CBN cut the MPR at the 306th MPC meeting on July 20-21, 2026?',prob:0,yes:0,no:100,vol:'\u20a6268.1K',ends:'',status:'resolved',result:'NO'},
 {id:'m6',title:'Will inflation rate fall below 14% by December 2026?',prob:39,yes:39,no:61,vol:'\u20a6378K',ends:'56d',status:'active'}];
export const featured=[
 {id:'f1',topic:'Politics & Elections',title:'Will Peter Obi be declared winner of the 2027 Nigerian presidential election?',yes:85,no:122,vol:'\u20a6251.2K',ends:'73d',yesPct:59,news:'Peter Obi is the Nigeria Democratic Congress presidential candidate for the 2027 Nigerian general election.',source:'INEC',series:series(58,59)},
 {id:'f2',topic:'Economy & Finance',title:'Will the Naira trade below \u20a61,000 per $1 before year-end?',yes:96,no:104,vol:'\u20a6722.5K',ends:'59d',yesPct:52,news:'A billionaire investor has projected the naira could appreciate to below \u20a61,000 against the US dollar before year-end.',source:'CBN',series:series(40,52)}];
export const wallet={cash:0,onHold:0,totalBalance:0};
export const summary={portfolioValue:0,openPnl:0,settledPnl:0,positionsCount:0};
