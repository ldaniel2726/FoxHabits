import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto py-8 bg-gray-100 dark:bg-zinc-700 dark:text-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-orange-700 mb-6">FoxHabits</h2>
            <p className="text-gray-600 dark:text-gray-200">A <span className='text-orange-700 font-bold'>FoxHabits</span> egy webalkalmazás, amely segít a felhasználóknak
            megfigyelni a szokásaikat és teendőiket.</p>
          </div>
          <nav className="text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-400 mb-6">Hivatkozások</h3>
            <ul className="space-y-2">
              <li>
                <Link legacyBehavior href="/login">
                  <a className='text-gray-600 dark:text-gray-200 hover:text-gray-900 transition transform inline-block hover:translate-x-3 py-2 px-4'>Bejelentkezés</a>
                </Link>
              </li>
              <li>
                <Link legacyBehavior href="/signup">
                  <a className='text-gray-600 dark:text-gray-200 hover:text-gray-900 transition transform inline-block hover:translate-x-3 py-2 px-4'>Regisztráció</a>
                </Link>
              </li>
            </ul>
          </nav>
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-400 mb-6">Kapcsolat</h3>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-200 mb-2 py-2 px-4">
              <Mail className="w-5 h-5" />
              <p>foxhabits@zente.org</p>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-200 py-2 px-4">
              <MapPin className="w-5 h-5" />
              <p>1134, Budapest Váci út 21.</p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">{new Date().getFullYear()} - FoxHabits</p>
        </div>
      </div>
    </footer>
  )
}
