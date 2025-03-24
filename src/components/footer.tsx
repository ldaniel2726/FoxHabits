import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto py-8 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Fox Habits</h2>
            <p className="text-gray-600">A Fox Habits egy webalkalmazás, amely segít a felhasználóknak
            megfigyelni a szokásaikat és teendőiket.</p>
          </div>
          <nav className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hivatkozások</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Rólunk
                </Link>
              </li>
              <li>
                <Link href="/plans" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Csomagok
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Fiók
                </Link>
              </li>
            </ul>
          </nav>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Kapcsolat</h3>
            <p className="text-gray-600 mb-2">Email: info@foxhabits.com</p>
            <p className="text-gray-600">Telefonszám: (123) 456-7890</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600">2024 Fox Habits</p>
        </div>
      </div>
    </footer>
  )
}
