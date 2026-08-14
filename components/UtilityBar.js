import LanguageSelector from './LanguageSelector'

export default function UtilityBar() {
  return (
    <div className="w-full bg-[#F7F7FB] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-2 flex items-center justify-between">
        <a
          href="mailto:info@ndarinzwe.com"
          className="text-sm text-black hover:text-navy transition-colors"
        >
          info@ndarinzwe.com
        </a>

        <div className="flex items-center gap-6 md:gap-10">
          <a href="#" className="hidden sm:block text-sm text-black hover:text-navy transition-colors">
            Find a CHW
          </a>
          <a href="#" className="hidden sm:block text-sm text-black hover:text-navy transition-colors">
            Need Help?
          </a>
          <a href="#" className="hidden md:block text-sm text-black hover:text-navy transition-colors">
            Accessibility
          </a>
          <LanguageSelector />
        </div>
      </div>
    </div>
  )
}
