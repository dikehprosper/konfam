const Footer = () => {
  return (
      <footer className="px-4 pb-8 pt-20 text-center text-xs text-muted sm:pt-24">
          <a href="/" aria-label="Konfam home" className="display mb-8 inline-flex items-center gap-3 text-4xl text-primary sm:text-5xl">
              <img src="/konfam-mark.svg" alt="" className="h-12 w-12 sm:h-14 sm:w-14" />
              <span>konfam</span>
          </a>
          <p className="mx-auto max-w-4xl leading-relaxed">Demo only. Markets, prices, balances, trades, and trader activity are simulated and may not reflect real markets or participants. No real-money transactions are made through this demo. Nothing on this platform is an offer to invest or financial advice.</p>
          <p className="mt-4">© {new Date().getFullYear()} Konfam. All rights reserved.</p>
          <p className="mt-1">Trade your take on what happens next.</p>
      </footer>
  )
}

export default Footer