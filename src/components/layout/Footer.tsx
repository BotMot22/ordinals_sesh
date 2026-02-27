import { Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-800/50 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">O</span>
            </div>
            <span className="text-gray-400 text-sm">
              OrdinalsSesh — Non-custodial Ordinals trading
            </span>
          </div>

          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <span>Zero fees. Your keys, your inscriptions.</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/orenyomtov/openordex"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
