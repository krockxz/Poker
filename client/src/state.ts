export let yourStack: number = (window as any).yourStack || 0;
export let currPot: number = (window as any).currPot || 0;
export let currMoneyInBetting: number = (window as any).currMoneyInBetting || 0;
export let username: string | null = localStorage.getItem('name');

export function setYourStack(val: number) { yourStack = val; }
export function setCurrPot(val: number) { currPot = val; }
export function setCurrMoneyInBetting(val: number) { currMoneyInBetting = val; }
export function setUsername(val: string | null) { username = val; }
